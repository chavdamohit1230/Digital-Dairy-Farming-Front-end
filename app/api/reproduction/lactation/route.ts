import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

async function nextId(db: Awaited<ReturnType<typeof getDb>>, collection: string, prefix: string) {
  const last = await db.collection(collection)
    .find({ uniqueId: { $regex: new RegExp(`^${prefix}\\d+$`) } })
    .sort({ uniqueId: -1 }).limit(1).toArray();
  const lastNum = last.length > 0 ? parseInt(last[0].uniqueId.replace(prefix, ""), 10) : 0;
  return `${prefix}${String(lastNum + 1).padStart(3, "0")}`;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// GET /api/reproduction/lactation
export async function GET() {
  try {
    const db = await getDb();
    const records = await db.collection("lactationCycles").find({}).sort({ calvingDate: -1 }).toArray();
    const today = new Date().toISOString().split("T")[0];
    const data = records.map((r) => {
      const dim = r.status === "Active" ? daysSince(r.calvingDate) : r.daysInMilk ?? 0;
      const expectedDryDate = addDays(r.calvingDate, 305);
      return {
        id: r.uniqueId ?? r._id?.toString(),
        animalId: r.animalId,
        animalName: r.animalName,
        calvingDate: r.calvingDate,
        lactationNumber: r.lactationNumber ?? 1,
        daysInMilk: dim,
        expectedDryDate,
        totalYield305: r.totalYield305 ?? null,
        peakYield: r.peakYield ?? null,
        peakYieldDate: r.peakYieldDate ?? "",
        status: r.status ?? "Active",
        calfId: r.calfId ?? "",
        notes: r.notes ?? "",
        createdAt: r.createdAt,
      };
    });
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/reproduction/lactation]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch lactation cycles." }, { status: 500 });
  }
}

// POST /api/reproduction/lactation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { animalId, animalName, calvingDate, lactationNumber, peakYield, peakYieldDate, calfId, notes } = body;
    if (!animalName || !calvingDate) {
      return NextResponse.json({ success: false, message: "animalName and calvingDate are required." }, { status: 400 });
    }
    const db = await getDb();
    const uniqueId = await nextId(db, "lactationCycles", "LC");
    const dim = daysSince(calvingDate);
    const doc = {
      uniqueId,
      animalId: animalId ?? "",
      animalName,
      calvingDate,
      lactationNumber: lactationNumber ? Number(lactationNumber) : 1,
      daysInMilk: dim,
      expectedDryDate: addDays(calvingDate, 305),
      totalYield305: null,
      peakYield: peakYield ? Number(peakYield) : null,
      peakYieldDate: peakYieldDate ?? "",
      status: "Active",
      calfId: calfId ?? "",
      notes: notes ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("lactationCycles").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/reproduction/lactation]", e);
    return NextResponse.json({ success: false, message: "Failed to save lactation cycle." }, { status: 500 });
  }
}

// PATCH /api/reproduction/lactation?id=LC001
export async function PATCH(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const body = await req.json();
    const db = await getDb();
    await db.collection("lactationCycles").updateOne(
      { uniqueId: id },
      { $set: { ...body, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/reproduction/lactation]", e);
    return NextResponse.json({ success: false, message: "Failed to update." }, { status: 500 });
  }
}

// DELETE /api/reproduction/lactation?id=LC001
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("lactationCycles").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/reproduction/lactation]", e);
    return NextResponse.json({ success: false, message: "Failed to delete." }, { status: 500 });
  }
}
