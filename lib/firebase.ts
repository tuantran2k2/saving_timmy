import { SignJWT, importPKCS8 } from "jose";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL!;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY!
  .replace(/\\n/g, "\n")
  .replace(/^"|"$/g, ""); // strip surrounding quotes if any
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getToken(): Promise<string> {
  const privateKey = await importPKCS8(PRIVATE_KEY, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(CLIENT_EMAIL)
    .setSubject(CLIENT_EMAIL)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

// ---- Firestore value converters ----

function toFirestore(value: unknown): unknown {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestore) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = toFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

function fromFirestore(fields: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = parseValue(val as Record<string, unknown>);
  }
  return result;
}

function parseValue(val: Record<string, unknown>): unknown {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return Number(val.integerValue);
  if ("doubleValue" in val) return Number(val.doubleValue);
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("arrayValue" in val) {
    const arr = val.arrayValue as { values?: unknown[] };
    return (arr.values ?? []).map((v) => parseValue(v as Record<string, unknown>));
  }
  if ("mapValue" in val) {
    const map = val.mapValue as { fields?: Record<string, unknown> };
    return fromFirestore(map.fields ?? {});
  }
  return null;
}

// ---- CRUD helpers ----

export async function getCollection(col: string): Promise<Array<Record<string, unknown>>> {
  const token = await getToken();
  const res = await fetch(`${BASE}/${col}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.documents) return [];
  return json.documents.map((doc: { name: string; fields: Record<string, unknown> }) => {
    const id = doc.name.split("/").pop();
    // Always use the id from the document path, not from stored fields
    const { id: _ignored, ...rest } = fromFirestore(doc.fields);
    void _ignored;
    return { id, ...rest };
  });
}

export async function getDocument(col: string, id: string): Promise<Record<string, unknown> | null> {
  const token = await getToken();
  const res = await fetch(`${BASE}/${col}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const doc = await res.json();
  // Always use the id from the document path, not from stored fields
  const { id: _ignored, ...rest } = fromFirestore(doc.fields ?? {});
  void _ignored;
  return { id, ...rest };
}

export async function createDocument(col: string, data: Record<string, unknown>): Promise<string> {
  const token = await getToken();
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestore(v);
  }
  const res = await fetch(`${BASE}/${col}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  const doc = await res.json();
  return doc.name.split("/").pop();
}

export async function setDocument(col: string, id: string, data: Record<string, unknown>): Promise<void> {
  const token = await getToken();
  const fields: Record<string, unknown> = {};
  // Filter out undefined values to avoid writing null to Firestore for missing fields
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  for (const [k, v] of Object.entries(cleanData)) {
    fields[k] = toFirestore(v);
  }
  // Build updateMask so PATCH only touches the fields we provide
  const fieldPaths = Object.keys(cleanData).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
  const url = `${BASE}/${col}/${id}?${fieldPaths}`;
  await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
}

export async function deleteDocument(col: string, id: string): Promise<void> {
  const token = await getToken();
  await fetch(`${BASE}/${col}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
