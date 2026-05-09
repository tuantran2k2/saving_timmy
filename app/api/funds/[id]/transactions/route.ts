import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { Transaction } from "@/lib/types";

const COL = "funds";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await db.collection(COL).doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const fund = doc.data();
  return NextResponse.json(fund?.transactions ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const newTx: Transaction = {
    id: Date.now().toString(),
    type: body.type,
    amount: body.amount,
    note: body.note,
    date: body.date,
    category: body.category || "other",
  };

  await db.collection(COL).doc(id).update({
    transactions: FieldValue.arrayUnion(newTx),
  });

  return NextResponse.json(newTx, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("txId");

  const doc = await db.collection(COL).doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fund = doc.data();
  const transactions = (fund?.transactions ?? []).filter(
    (t: Transaction) => t.id !== txId
  );

  await db.collection(COL).doc(id).update({ transactions });
  return NextResponse.json({ success: true });
}
