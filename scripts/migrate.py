import json
import os
from pathlib import Path

# Load .env.local
env_path = Path(__file__).parent.parent / ".env.local"
for line in env_path.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"'))

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate({
    "type": "service_account",
    "project_id": os.environ["FIREBASE_PROJECT_ID"],
    "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
    "private_key": os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n"),
    "token_uri": "https://oauth2.googleapis.com/token",
})

firebase_admin.initialize_app(cred)
db = firestore.client()

data = json.loads(
    (Path(__file__).parent.parent / "data" / "savings.json").read_text(encoding="utf-8")
)

print(f"Migrating {len(data['funds'])} funds...")

for i, fund in enumerate(data["funds"]):
    fund_id = fund["id"]
    payload = {k: v for k, v in fund.items() if k != "id"}
    payload["createdAt"] = i + 1
    db.collection("funds").document(fund_id).set(payload)
    print(f"OK: fund {i+1} uploaded")

print("Done!")
