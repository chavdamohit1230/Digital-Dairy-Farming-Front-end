export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
// Computes live dashboard stats from MongoDB Atlas collections
export async function GET() {
  try {
    const db = await getDb();

    // ── Animals ──────────────────────────────────────────────────────────────
    const animals = await db.collection("animals").find({}).toArray();
    const totalAnimals = animals.length;
    const lactating = animals.filter((a) => a.status === "Lactating").length;
    const pregnant = animals.filter((a) => a.status === "Pregnant").length;
    const dry = animals.filter((a) => a.status === "Dry").length;
    const sick = animals.filter((a) => a.status === "Sick").length;

    // Today's milk = sum of milkYieldPerDay for all lactating/sick+producing animals
    const todayMilk = animals.reduce((sum, a) => sum + (a.milkYieldPerDay ?? 0), 0);

    // Avg milk per lactating buffalo
    const lactatingAnimals = animals.filter((a) => (a.milkYieldPerDay ?? 0) > 0);
    const avgMilkPerBuffalo =
      lactatingAnimals.length > 0
        ? parseFloat((lactatingAnimals.reduce((s, a) => s + (a.milkYieldPerDay ?? 0), 0) / lactatingAnimals.length).toFixed(1))
        : 0;

    // Best performer
    const bestAnimal = animals.reduce(
      (best: null | { name: string; milkYieldPerDay: number }, a) =>
        (a.milkYieldPerDay ?? 0) > (best?.milkYieldPerDay ?? 0) ? a : best,
      null
    );
    const bestPerformer = bestAnimal
      ? `${bestAnimal.name} (${bestAnimal.milkYieldPerDay} L/day)`
      : "N/A";

    // Avg fat %
    const fatAnimals = animals.filter((a) => (a.fatPercentage ?? 0) > 0);
    const avgFatPercent =
      fatAnimals.length > 0
        ? parseFloat(
            (fatAnimals.reduce((s, a) => s + (a.fatPercentage ?? 0), 0) / fatAnimals.length).toFixed(1)
          )
        : 0;

    // ── Milk entries ─────────────────────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const milkEntries = await db
      .collection("milkEntries")
      .find({ date: today })
      .toArray();

    const todayMilkFromEntries = milkEntries.reduce(
      (sum, e) => sum + (e.totalQty ?? 0),
      0
    );

    // Use milk entries if they exist, otherwise fall back to animal yields
    const finalTodayMilk = todayMilkFromEntries > 0 ? todayMilkFromEntries : todayMilk;

    // ── Transactions ─────────────────────────────────────────────────────────
    const transactions = await db.collection("transactions").find({}).toArray();

    const todayTransactions = transactions.filter((t) => t.date === today);
    const todayIncome = todayTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const todayExpense = todayTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const todayProfit = todayIncome - todayExpense;

    // Monthly stats (current month)
    const currentMonth = today.slice(0, 7); // YYYY-MM
    const monthTransactions = transactions.filter(
      (t) => t.date && t.date.startsWith(currentMonth)
    );
    const monthIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const monthExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const monthProfit = monthIncome - monthExpense;

    // ── Milk chart – last 7 days ──────────────────────────────────────────────
    const last7: { day: string; morning: number; evening: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const dayEntries = await db
        .collection("milkEntries")
        .find({ date: dateStr })
        .toArray();
      const morning = dayEntries.reduce((s, e) => s + (e.morningQty ?? 0), 0);
      const evening = dayEntries.reduce((s, e) => s + (e.eveningQty ?? 0), 0);
      last7.push({ day: dayLabel, morning, evening, total: morning + evening });
    }

    // ── Monthly finance chart – last 6 months ────────────────────────────────
    const last6Months: { month: string; income: number; expense: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleDateString("en-IN", { month: "short" });
      const mTx = transactions.filter((t) => t.date && t.date.startsWith(monthKey));
      const inc = mTx.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount ?? 0), 0);
      const exp = mTx.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount ?? 0), 0);
      last6Months.push({ month: monthLabel, income: inc, expense: exp, profit: inc - exp });
    }

    // ── Upcoming alerts from DB ───────────────────────────────────────────────
    const dbAlerts: { id: number; type: string; message: string; severity: "info" | "warning" | "error" }[] = [];
    let alertId = 1;

    // Vaccination alerts
    for (const a of animals) {
      if (a.nextVaccination) {
        const vaccDate = new Date(a.nextVaccination);
        const diffDays = Math.ceil((vaccDate.getTime() - Date.now()) / 86400000);
        if (diffDays < 0) {
          dbAlerts.push({ id: alertId++, type: "vaccination", message: `${a.name} – Vaccination overdue since ${a.nextVaccination}`, severity: "error" });
        } else if (diffDays <= 30) {
          dbAlerts.push({ id: alertId++, type: "vaccination", message: `${a.name} – Vaccination due on ${a.nextVaccination}`, severity: "warning" });
        }
      }
      if (a.deliveryDate) {
        dbAlerts.push({ id: alertId++, type: "delivery", message: `${a.name} – Expected delivery: ${a.deliveryDate}`, severity: "info" });
      }
      if (a.lastHeatDate) {
        dbAlerts.push({ id: alertId++, type: "heat", message: `${a.name} – Heat detected on ${a.lastHeatDate}`, severity: "warning" });
      }
      if (a.status === "Sick") {
        dbAlerts.push({ id: alertId++, type: "medical", message: `${a.name} – Currently sick, monitor closely`, severity: "error" });
      }
    }

    // Feed stock alerts
    const feeds = await db.collection("feedInventory").find({}).toArray();
    for (const f of feeds) {
      if ((f.stock ?? 0) <= (f.lowStockThreshold ?? 0)) {
        dbAlerts.push({ id: alertId++, type: "stock", message: `${f.name} stock critically low (${f.stock} ${f.unit})`, severity: "error" });
      }
    }

    // Loan EMI alerts
    const loans = await db.collection("loans").find({}).toArray();
    for (const l of loans) {
      if (l.emiDueDate) {
        const emiDate = new Date(l.emiDueDate);
        const diffDays = Math.ceil((emiDate.getTime() - Date.now()) / 86400000);
        if (diffDays >= 0 && diffDays <= 10) {
          dbAlerts.push({ id: alertId++, type: "emi", message: `${l.source} EMI due on ${l.emiDueDate} – Rs ${l.emiAmount?.toLocaleString()}`, severity: "warning" });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        animals: { total: totalAnimals, lactating, pregnant, dry, sick },
        milk: {
          todayMilk: finalTodayMilk,
          avgMilkPerBuffalo,
          bestPerformer,
          avgFatPercent,
        },
        finance: { todayIncome, todayExpense, todayProfit, monthProfit, monthExpense },
        charts: { dailyMilk: last7, monthlyFinance: last6Months },
        alerts: dbAlerts,
      },
    });
  } catch (e) {
    console.error("[GET /api/dashboard]", e);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
