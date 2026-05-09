import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { Fund } from "@/lib/types";

const COL = "funds";

export async function GET() {
  const snapshot = await db.collection(COL).orderBy("createdAt").get();
  const funds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(funds);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newFund = {
    title: body.title,
    description: body.description || "",
    color: body.color || "#10b981",
    icon: body.icon || "piggy",
    targetAmount: body.targetAmount || 0,
    deadline: body.deadline || "",
    transactions: [],
    createdAt: Date.now(),
  };
  const ref = await db.collection(COL).add(newFund);
  return NextResponse.json({ id: ref.id, ...newFund }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, transactions, createdAt, ...fields } = body;
  void transactions; void createdAt;
  await db.collection(COL).doc(id).update(fields);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.collection(COL).doc(id).delete();
  return NextResponse.json({ success: true });
}
