import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

async function nextId(db: Awaited<ReturnType<typeof getDb>>, collection: string, prefix: string) {
  const last = await db.collection(collection)
    .find({ uniqueId: { $regex: new RegExp(`^${prefix}\\d+$`) } })
    .sort({ uniqueId: -1 }).limit(1).toArray();
  const lastNum = last.length > 0 ? parseInt(last[0].uniqueId.replace(prefix, ""), 10) : 0;
  return `${prefix}${String(lastNum + 1).padStart(3, "0")}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// GET /api/reproduction/pregnancy
export async function GET() {
  try {
    const db = await getDb();
    const records = await db.collection("pregnancyRecords").find({}).sort({ conceptionDate: -1 }).toArray();
    const data = records.map((r) => ({
      id: r.uniqueId ?? r._id?.toString(),
      animalId: r.animalId,
      animalName: r.animalName,
      conceptionDate: r.conceptionDate,
      expectedCalving: r.expectedCalving ?? addDays(r.conceptionDate, 285),
      dryPeriodStart: r.dryPeriodStart ?? addDays(r.expectedCalving ?? addDays(r.conceptionDate, 285), -60),
      actualCalvingDate: r.actualCalvingDate ?? "",
      calfSex: r.calfSex ?? "",
      calfWeight: r.calfWeight ?? null,
      complications: r.complications ?? "",
      status: r.status ?? "Active",
      diagnosedBy: r.diagnosedBy ?? "",
      notes: r.notes ?? "",
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/reproduction/pregnancy]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch pregnancy records." }, { status: 500 });
  }
}

// POST /api/reproduction/pregnancy
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { animalId, animalName, conceptionDate, diagnosedBy, notes } = body;
    if (!animalName || !conceptionDate) {
      return NextResponse.json({ success: false, message: "animalName and conceptionDate are required." }, { status: 400 });
    }
    const expectedCalving = addDays(conceptionDate, 285);
    const dryPeriodStart  = addDays(expectedCalving, -60);
    const db = await getDb();
    const uniqueId = await nextId(db, "pregnancyRecords", "PG");
    const doc = {
      uniqueId,
      animalId: animalId ?? "",
      animalName,
      conceptionDate,
      expectedCalving,
      dryPeriodStart,
      actualCalvingDate: "",
      calfSex: "",
      calfWeight: null,
      complications: "",
      status: "Active",
      diagnosedBy: diagnosedBy ?? "",
      notes: notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("pregnancyRecords").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/reproduction/pregnancy]", e);
    return NextResponse.json({ success: false, message: "Failed to save pregnancy record." }, { status: 500 });
  }
}

// PATCH /api/reproduction/pregnancy?id=PG001 — record calving / update
export async function PATCH(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const body = await req.json();
    const db = await getDb();
    await db.collection("pregnancyRecords").updateOne(
      { uniqueId: id },
      { $set: { ...body, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/reproduction/pregnancy]", e);
    return NextResponse.json({ success: false, message: "Failed to update pregnancy record." }, { status: 500 });
  }
}

// DELETE /api/reproduction/pregnancy?id=PG001
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("pregnancyRecords").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/reproduction/pregnancy]", e);
    return NextResponse.json({ success: false, message: "Failed to delete." }, { status: 500 });
  }
}
