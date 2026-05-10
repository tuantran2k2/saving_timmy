import { NextRequest, NextResponse } from "next/server";
import { getCollection, createDocument, setDocument, deleteDocument, getDocument } from "@/lib/firebase";
import { Fund } from "@/lib/types";

const COL = "funds";

export async function GET() {
  const funds = await getCollection(COL);
  return NextResponse.json(funds);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = {
    title: body.title,
    description: body.description || "",
    color: body.color || "#10b981",
    icon: body.icon || "piggy",
    targetAmount: body.targetAmount || 0,
    deadline: body.deadline || "",
    transactions: [],
    createdAt: Date.now(),
  };
  const id = await createDocument(COL, data);
  return NextResponse.json({ id, ...data }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...fields } = body;
  const existing = await getDocument(COL, id) as Fund | null;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await setDocument(COL, id, { ...existing, ...fields, id: undefined });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteDocument(COL, id);
  return NextResponse.json({ success: true });
}
