import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── Helper: max-based uniqueId ───────────────────────────────────────────────
async function nextId(db: Awaited<ReturnType<typeof getDb>>, collection: string, prefix: string) {
  const last = await db.collection(collection)
    .find({ uniqueId: { $regex: new RegExp(`^${prefix}\\d+$`) } })
    .sort({ uniqueId: -1 }).limit(1).toArray();
  const lastNum = last.length > 0 ? parseInt(last[0].uniqueId.replace(prefix, ""), 10) : 0;
  return `${prefix}${String(lastNum + 1).padStart(3, "0")}`;
}

// Add 21 days to date string
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// GET /api/reproduction/heat
export async function GET() {
  try {
    const db = await getDb();
    const records = await db.collection("heatRecords").find({}).sort({ date: -1 }).toArray();
    const data = records.map((r) => ({
      id: r.uniqueId ?? r._id?.toString(),
      animalId: r.animalId,
      animalName: r.animalName,
      date: r.date,
      detectedBy: r.detectedBy ?? "Manual",
      intensity: r.intensity ?? "Moderate",
      nextExpectedHeat: r.nextExpectedHeat ?? addDays(r.date, 21),
      notes: r.notes ?? "",
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/reproduction/heat]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch heat records." }, { status: 500 });
  }
}

// POST /api/reproduction/heat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { animalId, animalName, date, detectedBy, intensity, notes } = body;
    if (!animalName || !date) {
      return NextResponse.json({ success: false, message: "animalName and date are required." }, { status: 400 });
    }
    const db = await getDb();
    const uniqueId = await nextId(db, "heatRecords", "HR");
    const doc = {
      uniqueId,
      animalId: animalId ?? "",
      animalName,
      date,
      detectedBy: detectedBy ?? "Manual",
      intensity: intensity ?? "Moderate",
      nextExpectedHeat: addDays(date, 21),
      notes: notes ?? "",
      createdAt: new Date(),
    };
    await db.collection("heatRecords").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/reproduction/heat]", e);
    return NextResponse.json({ success: false, message: "Failed to save heat record." }, { status: 500 });
  }
}

// DELETE /api/reproduction/heat?id=HR001
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("heatRecords").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/reproduction/heat]", e);
    return NextResponse.json({ success: false, message: "Failed to delete." }, { status: 500 });
  }
}
