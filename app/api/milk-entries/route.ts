import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/milk-entries ────────────────────────────────────────────────────
// Returns milk entries from DB, optionally filtered by ?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const db = await getDb();

    const query = date ? { date } : {};
    const entries = await db
      .collection("milkEntries")
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const data = entries.map((e) => ({
      id: e.uniqueId ?? e._id?.toString(),
      buffaloId: e.buffaloId,
      buffaloName: e.buffaloName,
      date: e.date,
      morningQty: e.morningQty ?? 0,
      eveningQty: e.eveningQty ?? 0,
      totalQty: e.totalQty ?? (e.morningQty ?? 0) + (e.eveningQty ?? 0),
      fatPercent: e.fatPercent ?? 0,
      snfPercent: e.snfPercent ?? 0,
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/milk-entries]", e);
    return NextResponse.json(
      { success: false, message: "Failed to fetch milk entries." },
      { status: 500 }
    );
  }
}

// ─── POST /api/milk-entries ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buffaloId, buffaloName, date, morningQty, eveningQty, fatPercent, snfPercent } = body;

    if (!buffaloId || !date || morningQty == null || eveningQty == null) {
      return NextResponse.json(
        { success: false, message: "buffaloId, date, morningQty and eveningQty are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const count = await db.collection("milkEntries").countDocuments();
    const uniqueId = `M${String(count + 1).padStart(3, "0")}`;
    const totalQty = Number(morningQty) + Number(eveningQty);

    const doc = {
      uniqueId,
      buffaloId,
      buffaloName: buffaloName || buffaloId,
      date,
      morningQty: Number(morningQty),
      eveningQty: Number(eveningQty),
      totalQty,
      fatPercent: fatPercent ? Number(fatPercent) : 0,
      snfPercent: snfPercent ? Number(snfPercent) : 0,
      createdAt: new Date(),
    };

    await db.collection("milkEntries").insertOne(doc);
    return NextResponse.json({ success: true, data: { id: uniqueId, ...doc } });
  } catch (e) {
    console.error("[POST /api/milk-entries]", e);
    return NextResponse.json(
      { success: false, message: "Failed to save milk entry." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/milk-entries?id=M001 ────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "id param required" }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection("milkEntries").deleteOne({ uniqueId: id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/milk-entries]", e);
    return NextResponse.json({ success: false, message: "Failed to delete entry." }, { status: 500 });
  }
}
