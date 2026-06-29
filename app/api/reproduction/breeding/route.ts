import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

async function nextId(db: Awaited<ReturnType<typeof getDb>>, collection: string, prefix: string) {
  const last = await db.collection(collection)
    .find({ uniqueId: { $regex: new RegExp(`^${prefix}\\d+$`) } })
    .sort({ uniqueId: -1 }).limit(1).toArray();
  const lastNum = last.length > 0 ? parseInt(last[0].uniqueId.replace(prefix, ""), 10) : 0;
  return `${prefix}${String(lastNum + 1).padStart(3, "0")}`;
}

// GET /api/reproduction/breeding
export async function GET() {
  try {
    const db = await getDb();
    const records = await db.collection("breedingRecords").find({}).sort({ date: -1 }).toArray();
    const data = records.map((r) => ({
      id: r.uniqueId ?? r._id?.toString(),
      animalId: r.animalId,
      animalName: r.animalName,
      type: r.type ?? "AI",
      date: r.date,
      semenBull: r.semenBull ?? "",
      technician: r.technician ?? "",
      conception: r.conception ?? "Pending",
      pregnancyConfirmedDate: r.pregnancyConfirmedDate ?? "",
      cost: r.cost ?? 0,
      notes: r.notes ?? "",
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/reproduction/breeding]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch breeding records." }, { status: 500 });
  }
}

// POST /api/reproduction/breeding
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { animalId, animalName, type, date, semenBull, technician, conception, pregnancyConfirmedDate, cost, notes } = body;
    if (!animalName || !date) {
      return NextResponse.json({ success: false, message: "animalName and date are required." }, { status: 400 });
    }
    const db = await getDb();
    const uniqueId = await nextId(db, "breedingRecords", "BR");
    const doc = {
      uniqueId,
      animalId: animalId ?? "",
      animalName,
      type: type ?? "AI",
      date,
      semenBull: semenBull ?? "",
      technician: technician ?? "",
      conception: conception ?? "Pending",
      pregnancyConfirmedDate: pregnancyConfirmedDate ?? "",
      cost: cost ? Number(cost) : 0,
      notes: notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("breedingRecords").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/reproduction/breeding]", e);
    return NextResponse.json({ success: false, message: "Failed to save breeding record." }, { status: 500 });
  }
}

// PATCH /api/reproduction/breeding?id=BR001 — update conception status
export async function PATCH(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const body = await req.json();
    const db = await getDb();
    await db.collection("breedingRecords").updateOne(
      { uniqueId: id },
      { $set: { ...body, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/reproduction/breeding]", e);
    return NextResponse.json({ success: false, message: "Failed to update." }, { status: 500 });
  }
}

// DELETE /api/reproduction/breeding?id=BR001
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("breedingRecords").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/reproduction/breeding]", e);
    return NextResponse.json({ success: false, message: "Failed to delete." }, { status: 500 });
  }
}
