import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("medicines").find({}).sort({ name: 1 }).toArray();
    const data = items.map((m) => ({
      id: m.uniqueId ?? m._id?.toString(),
      name: m.name,
      stock: m.stock ?? 0,
      unit: m.unit ?? "bottles",
      threshold: m.threshold ?? 0,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/medicines]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch medicines." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, stock, unit, threshold } = body;
    if (!name || stock == null || !unit) {
      return NextResponse.json({ success: false, message: "name, stock and unit are required." }, { status: 400 });
    }
    const db = await getDb();
    const lastItem = await db.collection("medicines").find({ uniqueId: { $regex: /^MEDINV\d+$/ } }).sort({ uniqueId: -1 }).limit(1).toArray();
    const lastNum = lastItem.length > 0 ? parseInt(lastItem[0].uniqueId.replace("MEDINV", ""), 10) : 0;
    const uniqueId = `MEDINV${String(lastNum + 1).padStart(3, "0")}`;

    const doc = {
      uniqueId, name,
      stock: Number(stock),
      unit,
      threshold: threshold ? Number(threshold) : 0,
      createdAt: new Date(),
    };
    await db.collection("medicines").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/medicines]", e);
    return NextResponse.json({ success: false, message: "Failed to save medicine." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("medicines").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/medicines]", e);
    return NextResponse.json({ success: false, message: "Failed to delete item." }, { status: 500 });
  }
}
