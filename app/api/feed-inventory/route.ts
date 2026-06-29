import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/feed-inventory ──────────────────────────────────────────────────
export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("feedInventory").find({}).sort({ createdAt: 1 }).toArray();
    const data = items.map((f) => ({
      id: f.uniqueId ?? f._id?.toString(),
      type: f.type ?? "Concentrate",
      name: f.name,
      stock: f.stock ?? 0,
      unit: f.unit ?? "kg",
      costPerKg: f.costPerKg ?? 0,
      lowStockThreshold: f.lowStockThreshold ?? 0,
      lastRestocked: f.lastRestocked ?? null,
    }));
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/feed-inventory]", e);
    return NextResponse.json({ success: false, message: "Failed to fetch feed inventory." }, { status: 500 });
  }
}

// ─── POST /api/feed-inventory ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, stock, unit, costPerKg, lowStockThreshold } = body;
    if (!name || stock == null || !unit) {
      return NextResponse.json({ success: false, message: "name, stock and unit are required." }, { status: 400 });
    }
    const db = await getDb();

    // Fix: use max-based ID instead of countDocuments to avoid duplicate key after deletes
    const lastItem = await db
      .collection("feedInventory")
      .find({ uniqueId: { $regex: /^F\d+$/ } })
      .sort({ uniqueId: -1 })
      .limit(1)
      .toArray();
    const lastNum = lastItem.length > 0 ? parseInt(lastItem[0].uniqueId.replace("F", ""), 10) : 0;
    const uniqueId = `F${String(lastNum + 1).padStart(3, "0")}`;

    const doc = {
      uniqueId,
      type: type ?? "Concentrate",
      name,
      stock: Number(stock),
      unit,
      costPerKg: costPerKg ? Number(costPerKg) : 0,
      lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 0,
      lastRestocked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("feedInventory").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/feed-inventory]", e);
    return NextResponse.json({ success: false, message: "Failed to save feed item." }, { status: 500 });
  }
}

// ─── PATCH /api/feed-inventory?id=F001  ───────────────────────────────────────
// Body: { action: "restock" | "consume", quantity: number }
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });

    const body = await req.json();
    const { action, quantity } = body;
    if (!action || quantity == null || Number(quantity) <= 0)
      return NextResponse.json({ success: false, message: "action and positive quantity are required." }, { status: 400 });

    const db = await getDb();
    const item = await db.collection("feedInventory").findOne({ uniqueId: id });
    if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

    let newStock: number;
    if (action === "restock") {
      newStock = item.stock + Number(quantity);
    } else if (action === "consume") {
      newStock = Math.max(0, item.stock - Number(quantity));
    } else {
      return NextResponse.json({ success: false, message: 'action must be "restock" or "consume".' }, { status: 400 });
    }

    await db.collection("feedInventory").updateOne(
      { uniqueId: id },
      {
        $set: {
          stock: newStock,
          updatedAt: new Date(),
          ...(action === "restock" ? { lastRestocked: new Date() } : {}),
        },
      }
    );
    return NextResponse.json({ success: true, data: { id, stock: newStock } });
  } catch (e) {
    console.error("[PATCH /api/feed-inventory]", e);
    return NextResponse.json({ success: false, message: "Failed to update stock." }, { status: 500 });
  }
}

// ─── DELETE /api/feed-inventory?id=F001 ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("feedInventory").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/feed-inventory]", e);
    return NextResponse.json({ success: false, message: "Failed to delete item." }, { status: 500 });
  }
}
