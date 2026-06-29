export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/loans ───────────────────────────────────────────────────────────
export async function GET() {
  try {
    const db = await getDb();
    const loans = await db.collection("loans").find({}).sort({ createdAt: 1 }).toArray();
    const data = loans.map((l) => ({
      id: l.uniqueId ?? l._id?.toString(),
      source: l.source,
      amount: l.amount ?? 0,
      interestRate: l.interestRate ?? 0,
      emiAmount: l.emiAmount ?? 0,
      emiDueDate: l.emiDueDate ?? "",
      totalPaid: l.totalPaid ?? 0,
      remainingBalance: l.remainingBalance ?? 0,
      startDate: l.startDate ?? "",
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/loans]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch loans." }, { status: 500 });
  }
}

// ─── POST /api/loans ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, amount, interestRate, emiAmount, emiDueDate, startDate } = body;
    if (!source || !amount || !startDate) {
      return NextResponse.json({ success: false, message: "source, amount and startDate are required." }, { status: 400 });
    }
    const db = await getDb();
    const count = await db.collection("loans").countDocuments();
    const uniqueId = `L${String(count + 1).padStart(3, "0")}`;
    const doc = {
      uniqueId, source,
      amount: Number(amount),
      interestRate: interestRate ? Number(interestRate) : 0,
      emiAmount: emiAmount ? Number(emiAmount) : 0,
      emiDueDate: emiDueDate ?? "",
      totalPaid: 0,
      remainingBalance: Number(amount),
      startDate,
      createdAt: new Date(),
    };
    await db.collection("loans").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/loans]", e);
    return NextResponse.json({ success: false, message: "Failed to save loan." }, { status: 500 });
  }
}

// ─── DELETE /api/loans?id=L001 ───────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("loans").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Loan not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/loans]", e);
    return NextResponse.json({ success: false, message: "Failed to delete loan." }, { status: 500 });
  }
}
