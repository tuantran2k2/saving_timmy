import { NextRequest, NextResponse } from "next/server";
import { getDocument, setDocument } from "@/lib/firebase";
import { Fund, Transaction } from "@/lib/types";

const COL = "funds";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fund = await getDocument(COL, id) as Fund | null;
  if (!fund) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(fund.transactions ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const fund = await getDocument(COL, id) as Fund | null;
  if (!fund) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newTx: Transaction = {
    id: Date.now().toString(),
    type: body.type,
    amount: body.amount,
    note: body.note,
    date: body.date,
    category: body.category || "other",
  };

  const transactions = [...(fund.transactions ?? []), newTx];
  await setDocument(COL, id, { ...fund, id: undefined, transactions });

  return NextResponse.json(newTx, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const txId = searchParams.get("txId");

  const fund = await getDocument(COL, id) as Fund | null;
  if (!fund) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const transactions = (fund.transactions ?? []).filter(
    (t: Transaction) => t.id !== txId
  );
  await setDocument(COL, id, { ...fund, id: undefined, transactions });

  return NextResponse.json({ success: true });
}
