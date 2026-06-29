import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// GET /api/medical
export async function GET() {
  try {
    const db = await getDb();
    const records = await db.collection("medicalRecords").find({}).sort({ date: -1 }).toArray();
    const data = records.map((r) => ({
      id: r.uniqueId ?? r._id?.toString(),
      buffaloId: r.buffaloId,
      buffaloName: r.buffaloName,
      type: r.type,
      date: r.date,
      description: r.description,
      doctor: r.doctor,
      cost: r.cost,
      nextDue: r.nextDue,
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/medical]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch medical records." }, { status: 500 });
  }
}

// POST /api/medical
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buffaloId, buffaloName, type, date, description, doctor, cost, nextDue } = body;
    if (!buffaloName || !date || !type) {
      return NextResponse.json({ success: false, message: "buffaloName, date, and type are required." }, { status: 400 });
    }
    const db = await getDb();
    
    // Auto-generate ID
    const last = await db.collection("medicalRecords")
      .find({ uniqueId: { $regex: /^MED\d+$/ } })
      .sort({ uniqueId: -1 }).limit(1).toArray();
    const lastNum = last.length > 0 ? parseInt(last[0].uniqueId.replace("MED", ""), 10) : 0;
    const uniqueId = `MED${String(lastNum + 1).padStart(3, "0")}`;

    const doc = {
      uniqueId,
      buffaloId: buffaloId ?? "",
      buffaloName,
      type,
      date,
      description: description ?? "",
      doctor: doctor ?? "",
      cost: cost ? Number(cost) : 0,
      nextDue: nextDue ?? "",
      createdAt: new Date(),
    };
    await db.collection("medicalRecords").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/medical]", e);
    return NextResponse.json({ success: false, message: "Failed to save medical record." }, { status: 500 });
  }
}

// DELETE /api/medical?id=MED001
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("medicalRecords").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/medical]", e);
    return NextResponse.json({ success: false, message: "Failed to delete." }, { status: 500 });
  }
}
