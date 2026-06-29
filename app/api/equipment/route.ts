import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("equipment").find({}).sort({ name: 1 }).toArray();
    const data = items.map((e) => ({
      id: e.uniqueId ?? e._id?.toString(),
      name: e.name,
      status: e.status ?? "Working",
      lastService: e.lastService ?? "",
      nextService: e.nextService ?? "",
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/equipment]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch equipment." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, status, lastService, nextService } = body;
    if (!name || !status) {
      return NextResponse.json({ success: false, message: "name and status are required." }, { status: 400 });
    }
    const db = await getDb();
    const lastItem = await db.collection("equipment").find({ uniqueId: { $regex: /^EQP\d+$/ } }).sort({ uniqueId: -1 }).limit(1).toArray();
    const lastNum = lastItem.length > 0 ? parseInt(lastItem[0].uniqueId.replace("EQP", ""), 10) : 0;
    const uniqueId = `EQP${String(lastNum + 1).padStart(3, "0")}`;

    const doc = {
      uniqueId, name, status,
      lastService: lastService ?? "",
      nextService: nextService ?? "",
      createdAt: new Date(),
    };
    await db.collection("equipment").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/equipment]", e);
    return NextResponse.json({ success: false, message: "Failed to save equipment." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("equipment").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/equipment]", e);
    return NextResponse.json({ success: false, message: "Failed to delete item." }, { status: 500 });
  }
}
