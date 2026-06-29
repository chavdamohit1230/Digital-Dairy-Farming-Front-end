import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/animals ─────────────────────────────────────────────────────────
// Fetches all animals from MongoDB Atlas (digitalityfarming → animals)
// Returns same { success, count, data[] } format as the Express backend
export async function GET() {
  try {
    const db = await getDb();
    const animals = await db
      .collection("animals")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    const data = animals.map((b) => ({
      id: b.uniqueId ?? b._id?.toString(),
      name: b.name,
      tagNumber: b.tagNumber,
      breed: b.breed ?? "Murrah",
      age: b.age,
      weight: b.weight,
      status: b.status,
      stage: b.stage ?? b.status,
      bodyScore: b.bodyScore ?? null,
      purchaseDate: b.purchaseDate,
      purchaseCost: b.purchaseCost,
      source: b.source ?? "",
      milkYieldPerDay: b.milkYieldPerDay ?? 0,
      fatPercentage: b.fatPercentage ?? 0,
      insurance: b.insurance ?? "N/A",
      pregnancyDate: b.pregnancyDate ?? "",
      deliveryDate: b.deliveryDate ?? "",
      lastHeatDate: b.lastHeatDate ?? "",
      nextVaccination: b.nextVaccination ?? "",
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e) {
    console.error("[GET /api/animals]", e);
    return NextResponse.json(
      { success: false, message: "Failed to fetch animals from database." },
      { status: 500 }
    );
  }
}

// ─── POST /api/animals ────────────────────────────────────────────────────────
// Inserts a new animal — auto-generates BUF-style uniqueId
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, tagNumber, breed, age, weight, status, stage, bodyScore, purchaseDate, purchaseCost, source, milkYieldPerDay, fatPercentage } = body;

    if (!name || !tagNumber || !age || !weight || !status || !purchaseDate || !purchaseCost) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Auto-generate uniqueId: find the highest existing BUFxxx number and add 1
    // Using max instead of count so deletes never cause duplicate key collisions
    const lastAnimal = await db
      .collection("animals")
      .find({ uniqueId: { $regex: /^BUF\d+$/ } })
      .sort({ uniqueId: -1 })
      .limit(1)
      .toArray();
    const lastNum =
      lastAnimal.length > 0
        ? parseInt(lastAnimal[0].uniqueId.replace("BUF", ""), 10)
        : 0;
    const uniqueId = `BUF${String(lastNum + 1).padStart(3, "0")}`;

    const doc = {
      uniqueId,
      name,
      tagNumber,
      breed: breed || "Murrah",
      age: Number(age),
      weight: Number(weight),
      status,
      stage: stage || status,
      bodyScore: bodyScore ? Number(bodyScore) : null,
      purchaseDate,
      purchaseCost: Number(purchaseCost),
      source: source || "",
      milkYieldPerDay: milkYieldPerDay != null ? Number(milkYieldPerDay) : (status === "Lactating" ? 10 : 0),
      fatPercentage: fatPercentage != null ? Number(fatPercentage) : (status === "Lactating" ? 7.0 : 0),
      insurance: "N/A",
      pregnancyDate: "",
      deliveryDate: "",
      lastHeatDate: "",
      nextVaccination: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("animals").insertOne(doc);

    return NextResponse.json({
      success: true,
      data: { id: uniqueId, ...doc },
    });
  } catch (e) {
    console.error("[POST /api/animals]", e);
    return NextResponse.json(
      { success: false, message: "Failed to save animal to database." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/animals?id=BUF003 ───────────────────────────────────────────
// Deletes by uniqueId field
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "id param required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection("animals").deleteOne({ uniqueId: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Animal not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/animals]", e);
    return NextResponse.json(
      { success: false, message: "Failed to delete animal." },
      { status: 500 }
    );
  }
}
