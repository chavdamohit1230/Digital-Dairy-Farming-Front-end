export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/workers ─────────────────────────────────────────────────────────
export async function GET() {
  try {
    const db = await getDb();
    const workers = await db.collection("workers").find({}).sort({ createdAt: 1 }).toArray();
    const data = workers.map((w) => ({
      id: w.uniqueId ?? w._id?.toString(),
      name: w.name,
      role: w.role ?? "",
      salary: w.salary ?? 0,
      phone: w.phone ?? "",
      joinDate: w.joinDate ?? "",
      shift: w.shift ?? "Full Day",
      attendance: w.attendance ?? 0,
      advance: w.advance ?? 0,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/workers]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch workers." }, { status: 500 });
  }
}

// ─── POST /api/workers ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, salary, phone, joinDate, shift, attendance, advance } = body;
    if (!name || !salary || !joinDate) {
      return NextResponse.json({ success: false, message: "name, salary and joinDate are required." }, { status: 400 });
    }
    const db = await getDb();
    const count = await db.collection("workers").countDocuments();
    const uniqueId = `W${String(count + 1).padStart(3, "0")}`;
    const doc = {
      uniqueId, name, role: role ?? "",
      salary: Number(salary), phone: phone ?? "",
      joinDate, shift: shift ?? "Full Day",
      attendance: attendance ? Number(attendance) : 0,
      advance: advance ? Number(advance) : 0,
      createdAt: new Date(),
    };
    await db.collection("workers").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/workers]", e);
    return NextResponse.json({ success: false, message: "Failed to save worker." }, { status: 500 });
  }
}

// ─── DELETE /api/workers?id=W001 ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("workers").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Worker not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/workers]", e);
    return NextResponse.json({ success: false, message: "Failed to delete worker." }, { status: 500 });
  }
}
