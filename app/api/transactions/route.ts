export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/transactions ───────────────────────────────────────────────────
export async function GET() {
  try {
    const db = await getDb();
    const txns = await db
      .collection("transactions")
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const data = txns.map((t) => ({
      id: t.uniqueId ?? t._id?.toString(),
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date,
      description: t.description ?? "",
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/transactions]", e);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions." },
      { status: 500 }
    );
  }
}

// ─── POST /api/transactions ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, category, amount, date, description } = body;

    if (!type || !category || !amount || !date) {
      return NextResponse.json(
        { success: false, message: "type, category, amount and date are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const count = await db.collection("transactions").countDocuments();
    const uniqueId = `T${String(count + 1).padStart(3, "0")}`;

    const doc = {
      uniqueId,
      type,
      category,
      amount: Number(amount),
      date,
      description: description ?? "",
      createdAt: new Date(),
    };

    await db.collection("transactions").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/transactions]", e);
    return NextResponse.json(
      { success: false, message: "Failed to save transaction." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/transactions?id=T001 ────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "id param required" }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection("transactions").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Transaction not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/transactions]", e);
    return NextResponse.json({ success: false, message: "Failed to delete transaction." }, { status: 500 });
  }
}
