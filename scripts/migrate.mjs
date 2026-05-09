// Chạy: node scripts/migrate.mjs
// Yêu cầu: đã set biến môi trường trong .env.local

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();
const data = JSON.parse(
  readFileSync(join(__dirname, "../data/savings.json"), "utf-8")
);

console.log(`Migrating ${data.funds.length} funds...`);

for (const fund of data.funds) {
  const { id, ...rest } = fund;
  await db.collection("funds").doc(id).set({
    ...rest,
    createdAt: Date.now(),
  });
  console.log(`✓ ${fund.title}`);
}

console.log("Done!");
process.exit(0);
