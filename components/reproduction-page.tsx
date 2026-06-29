"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Heart, Baby, Calendar, AlertTriangle, TrendingUp,
  Plus, Trash2, RefreshCw, Loader2, AlertCircle,
  Thermometer, Syringe, Activity, CheckCircle2, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeatRecord {
  id: string; animalId: string; animalName: string; date: string;
  detectedBy: string; intensity: string; nextExpectedHeat: string; notes: string;
}
interface BreedingRecord {
  id: string; animalId: string; animalName: string; type: string; date: string;
  semenBull: string; technician: string; conception: string;
  pregnancyConfirmedDate: string; cost: number; notes: string;
}
interface PregnancyRecord {
  id: string; animalId: string; animalName: string; conceptionDate: string;
  expectedCalving: string; dryPeriodStart: string; actualCalvingDate: string;
  calfSex: string; calfWeight: number | null; complications: string;
  status: string; diagnosedBy: string; notes: string;
}
interface LactationRecord {
  id: string; animalId: string; animalName: string; calvingDate: string;
  lactationNumber: number; daysInMilk: number; expectedDryDate: string;
  totalYield305: number | null; peakYield: number | null;
  peakYieldDate: string; status: string; calfId: string; notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(d: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}

// ─── Sub-component: Section loader ────────────────────────────────────────────
function SectionLoader() {
  return (
    <div className="flex items-center justify-center h-32 gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading from database…</p>
    </div>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} className="text-center py-10 text-muted-foreground text-sm">{message}</TableCell>
    </TableRow>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ReproductionPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [heatRecords,      setHeatRecords]      = useState<HeatRecord[]>([]);
  const [breedingRecords,  setBreedingRecords]  = useState<BreedingRecord[]>([]);
  const [pregnancyRecords, setPregnancyRecords] = useState<PregnancyRecord[]>([]);
  const [lactationRecords, setLactationRecords] = useState<LactationRecord[]>([]);
  const [loading, setLoading] = useState({ heat: true, breeding: true, pregnancy: true, lactation: true });
  const [errors,  setErrors]  = useState({ heat: "", breeding: "", pregnancy: "", lactation: "" });

  // ── Dialog state ─────────────────────────────────────────────────────────────
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Heat form
  const [hAnimal, setHAnimal] = useState(""); const [hDate, setHDate] = useState("");
  const [hBy, setHBy] = useState("Manual"); const [hIntensity, setHIntensity] = useState("Moderate");
  const [hNotes, setHNotes] = useState("");

  // Breeding form
  const [bAnimal, setBAnimal] = useState(""); const [bDate, setBDate] = useState("");
  const [bType, setBType] = useState("AI"); const [bBull, setBBull] = useState("");
  const [bTech, setBTech] = useState(""); const [bConception, setBConception] = useState("Pending");
  const [bCost, setBCost] = useState(""); const [bNotes, setBNotes] = useState("");

  // Pregnancy form
  const [pAnimal, setPAnimal] = useState(""); const [pConceptionDate, setPConceptionDate] = useState("");
  const [pDiagnosedBy, setPDiagnosedBy] = useState(""); const [pNotes, setPNotes] = useState("");

  // Lactation form
  const [lAnimal, setLAnimal] = useState(""); const [lCalvingDate, setLCalvingDate] = useState("");
  const [lLactationNo, setLLactationNo] = useState("1"); const [lPeakYield, setLPeakYield] = useState("");
  const [lCalfId, setLCalfId] = useState(""); const [lNotes, setLNotes] = useState("");

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchHeat = useCallback(async () => {
    setLoading((p) => ({ ...p, heat: true })); setErrors((p) => ({ ...p, heat: "" }));
    try {
      const res = await fetch("/api/reproduction/heat");
      const json = await res.json();
      if (json.success) setHeatRecords(json.data);
      else setErrors((p) => ({ ...p, heat: json.message }));
    } catch { setErrors((p) => ({ ...p, heat: "Cannot reach database." })); }
    finally { setLoading((p) => ({ ...p, heat: false })); }
  }, []);

  const fetchBreeding = useCallback(async () => {
    setLoading((p) => ({ ...p, breeding: true })); setErrors((p) => ({ ...p, breeding: "" }));
    try {
      const res = await fetch("/api/reproduction/breeding");
      const json = await res.json();
      if (json.success) setBreedingRecords(json.data);
      else setErrors((p) => ({ ...p, breeding: json.message }));
    } catch { setErrors((p) => ({ ...p, breeding: "Cannot reach database." })); }
    finally { setLoading((p) => ({ ...p, breeding: false })); }
  }, []);

  const fetchPregnancy = useCallback(async () => {
    setLoading((p) => ({ ...p, pregnancy: true })); setErrors((p) => ({ ...p, pregnancy: "" }));
    try {
      const res = await fetch("/api/reproduction/pregnancy");
      const json = await res.json();
      if (json.success) setPregnancyRecords(json.data);
      else setErrors((p) => ({ ...p, pregnancy: json.message }));
    } catch { setErrors((p) => ({ ...p, pregnancy: "Cannot reach database." })); }
    finally { setLoading((p) => ({ ...p, pregnancy: false })); }
  }, []);

  const fetchLactation = useCallback(async () => {
    setLoading((p) => ({ ...p, lactation: true })); setErrors((p) => ({ ...p, lactation: "" }));
    try {
      const res = await fetch("/api/reproduction/lactation");
      const json = await res.json();
      if (json.success) setLactationRecords(json.data);
      else setErrors((p) => ({ ...p, lactation: json.message }));
    } catch { setErrors((p) => ({ ...p, lactation: "Cannot reach database." })); }
    finally { setLoading((p) => ({ ...p, lactation: false })); }
  }, []);

  useEffect(() => { fetchHeat(); fetchBreeding(); fetchPregnancy(); fetchLactation(); }, [fetchHeat, fetchBreeding, fetchPregnancy, fetchLactation]);

  const refreshAll = () => { fetchHeat(); fetchBreeding(); fetchPregnancy(); fetchLactation(); };

  // ── Alerts (computed from live data) ──────────────────────────────────────────
  const alerts: { id: string; message: string; severity: "error" | "warning" | "info" }[] = [];

  // Heat alerts: next expected heat within 5 days
  for (const h of heatRecords) {
    if (!h.nextExpectedHeat) continue;
    const days = daysUntil(h.nextExpectedHeat);
    if (days >= 0 && days <= 5) {
      alerts.push({ id: `heat-${h.id}`, message: `${h.animalName} — Heat expected in ${days} day(s) (${formatDate(h.nextExpectedHeat)})`, severity: "warning" });
    }
  }

  // Pregnancy alerts: calving within 30 days
  for (const p of pregnancyRecords) {
    if (p.status !== "Active") continue;
    const days = daysUntil(p.expectedCalving);
    if (days >= 0 && days <= 30) {
      alerts.push({ id: `calv-${p.id}`, message: `${p.animalName} — Expected calving in ${days} day(s) (${formatDate(p.expectedCalving)})`, severity: days <= 7 ? "error" : "warning" });
    }
    // Dry period alert
    const dryDays = daysUntil(p.dryPeriodStart);
    if (dryDays >= 0 && dryDays <= 14) {
      alerts.push({ id: `dry-${p.id}`, message: `${p.animalName} — Dry period should start by ${formatDate(p.dryPeriodStart)}`, severity: "info" });
    }
  }

  // Breeding: pending conception check > 30 days
  for (const b of breedingRecords) {
    if (b.conception === "Pending" && daysUntil(b.date) < -30) {
      alerts.push({ id: `br-${b.id}`, message: `${b.animalName} — Conception result pending since ${formatDate(b.date)}`, severity: "warning" });
    }
  }

  // Lactation: nearing 305 days
  for (const l of lactationRecords) {
    if (l.status !== "Active") continue;
    const dryDays = daysUntil(l.expectedDryDate);
    if (dryDays >= 0 && dryDays <= 14) {
      alerts.push({ id: `lac-${l.id}`, message: `${l.animalName} — Approaching 305 DIM, consider drying off (${formatDate(l.expectedDryDate)})`, severity: "info" });
    }
  }

  // ── Fertility Analytics ──────────────────────────────────────────────────────
  const totalBreeding     = breedingRecords.length;
  const conceptionYes     = breedingRecords.filter((b) => b.conception === "Yes").length;
  const conceptionRate    = totalBreeding > 0 ? Math.round((conceptionYes / totalBreeding) * 100) : 0;
  const activePregnancies = pregnancyRecords.filter((p) => p.status === "Active").length;
  const activeLactations  = lactationRecords.filter((l) => l.status === "Active").length;
  const avgDIM            = activeLactations > 0
    ? Math.round(lactationRecords.filter((l) => l.status === "Active").reduce((s, l) => s + l.daysInMilk, 0) / activeLactations)
    : 0;
  const repeatBreederCount = breedingRecords
    .reduce((acc: Record<string, number>, b) => { if (b.conception === "No") acc[b.animalName] = (acc[b.animalName] ?? 0) + 1; return acc; }, {});
  const repeatBreeders = Object.values(repeatBreederCount).filter((c) => c >= 2).length;
  const totalBirths       = pregnancyRecords.filter((p) => p.status === "Completed").length;
  const femaleBirths      = pregnancyRecords.filter((p) => p.status === "Completed" && p.calfSex === "Female").length;

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const deleteHeat = async (id: string, name: string) => {
    if (!window.confirm(`Delete heat record for ${name}?`)) return;
    const res = await fetch(`/api/reproduction/heat?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) setHeatRecords((p) => p.filter((r) => r.id !== id));
    else alert(d.message);
  };
  const deleteBreeding = async (id: string, name: string) => {
    if (!window.confirm(`Delete breeding record for ${name}?`)) return;
    const res = await fetch(`/api/reproduction/breeding?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) setBreedingRecords((p) => p.filter((r) => r.id !== id));
    else alert(d.message);
  };
  const deletePregnancy = async (id: string, name: string) => {
    if (!window.confirm(`Delete pregnancy record for ${name}?`)) return;
    const res = await fetch(`/api/reproduction/pregnancy?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) setPregnancyRecords((p) => p.filter((r) => r.id !== id));
    else alert(d.message);
  };
  const deleteLactation = async (id: string, name: string) => {
    if (!window.confirm(`Delete lactation record for ${name}?`)) return;
    const res = await fetch(`/api/reproduction/lactation?id=${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) setLactationRecords((p) => p.filter((r) => r.id !== id));
    else alert(d.message);
  };

  // ── Submit handlers ──────────────────────────────────────────────────────────
  const submitHeat = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    if (!hAnimal || !hDate) { setFormError("Animal name and date are required."); return; }
    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/reproduction/heat", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalName: hAnimal, date: hDate, detectedBy: hBy, intensity: hIntensity, notes: hNotes }) });
      const data = await res.json();
      if (data.success) { setActiveDialog(null); resetForms(); fetchHeat(); }
      else setFormError(data.message);
    } catch { setFormError("Cannot reach database."); }
    finally { setIsSubmitting(false); }
  };

  const submitBreeding = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    if (!bAnimal || !bDate) { setFormError("Animal name and date are required."); return; }
    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/reproduction/breeding", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalName: bAnimal, date: bDate, type: bType, semenBull: bBull, technician: bTech, conception: bConception, cost: bCost, notes: bNotes }) });
      const data = await res.json();
      if (data.success) { setActiveDialog(null); resetForms(); fetchBreeding(); }
      else setFormError(data.message);
    } catch { setFormError("Cannot reach database."); }
    finally { setIsSubmitting(false); }
  };

  const submitPregnancy = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    if (!pAnimal || !pConceptionDate) { setFormError("Animal name and conception date are required."); return; }
    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/reproduction/pregnancy", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalName: pAnimal, conceptionDate: pConceptionDate, diagnosedBy: pDiagnosedBy, notes: pNotes }) });
      const data = await res.json();
      if (data.success) { setActiveDialog(null); resetForms(); fetchPregnancy(); }
      else setFormError(data.message);
    } catch { setFormError("Cannot reach database."); }
    finally { setIsSubmitting(false); }
  };

  const submitLactation = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError("");
    if (!lAnimal || !lCalvingDate) { setFormError("Animal name and calving date are required."); return; }
    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/reproduction/lactation", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animalName: lAnimal, calvingDate: lCalvingDate, lactationNumber: lLactationNo, peakYield: lPeakYield, calfId: lCalfId, notes: lNotes }) });
      const data = await res.json();
      if (data.success) { setActiveDialog(null); resetForms(); fetchLactation(); }
      else setFormError(data.message);
    } catch { setFormError("Cannot reach database."); }
    finally { setIsSubmitting(false); }
  };

  const resetForms = () => {
    setHAnimal(""); setHDate(""); setHBy("Manual"); setHIntensity("Moderate"); setHNotes("");
    setBAnimal(""); setBDate(""); setBType("AI"); setBBull(""); setBTech(""); setBConception("Pending"); setBCost(""); setBNotes("");
    setPAnimal(""); setPConceptionDate(""); setPDiagnosedBy(""); setPNotes("");
    setLAnimal(""); setLCalvingDate(""); setLLactationNo("1"); setLPeakYield(""); setLCalfId(""); setLNotes("");
    setFormError("");
  };

  const openDialog = (key: string) => { resetForms(); setActiveDialog(key); };

  // ── Badge helpers ────────────────────────────────────────────────────────────
  const intensityColor: Record<string, string> = {
    Mild: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Moderate: "bg-orange-50 text-orange-700 border-orange-200",
    Strong: "bg-red-50 text-red-700 border-red-200",
  };
  const conceptionColor: Record<string, string> = {
    Yes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    No: "bg-red-50 text-red-700 border-red-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const statusColor: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
    Aborted: "bg-red-50 text-red-700 border-red-200",
    Dry: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.reproduction.title}</h1>
          <p className="text-sm text-muted-foreground">
            Heat detection, AI & natural breeding, pregnancy, lactation cycle, and fertility analytics
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={refreshAll} title="Refresh all">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
              <Thermometer className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heat Records</p>
              <p className="text-xl font-bold">{heatRecords.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Syringe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Breeding Records</p>
              <p className="text-xl font-bold">{breedingRecords.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Baby className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Pregnancies</p>
              <p className="text-xl font-bold">{activePregnancies}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Lactations</p>
              <p className="text-xl font-bold">{activeLactations}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Alerts ── */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Reproduction Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.id}>
                  <Badge variant="outline" className={
                    a.severity === "error"   ? "bg-red-50 text-red-700 border-red-200" :
                    a.severity === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                              "bg-blue-50 text-blue-700 border-blue-200"
                  }>
                    {a.message}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="heat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1">
          <TabsTrigger value="heat">🌡️ {t.reproduction.heatDetection}</TabsTrigger>
          <TabsTrigger value="breeding">🧬 {t.reproduction.aiRecord}</TabsTrigger>
          <TabsTrigger value="pregnancy">🤰 {t.reproduction.pregnancyDiagnosis}</TabsTrigger>
          <TabsTrigger value="lactation">🥛 {t.reproduction.lactationCycle}</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        </TabsList>

        {/* ═══ HEAT DETECTION ═══ */}
        <TabsContent value="heat" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Thermometer className="h-4 w-4 text-pink-600" />
                </div>
                <CardTitle className="text-base">Heat Detection History</CardTitle>
              </div>
              <Button size="sm" onClick={() => openDialog("heat")}>
                <Plus className="h-4 w-4 mr-1" />Add Heat Record
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading.heat ? <SectionLoader /> : errors.heat ? (
                <p className="text-sm text-destructive p-4">{errors.heat}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.nav.buffalo}</TableHead>
                        <TableHead>Date Detected</TableHead>
                        <TableHead>Intensity</TableHead>
                        <TableHead>Detected By</TableHead>
                        <TableHead>Next Expected Heat</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {heatRecords.length === 0 ? (
                        <EmptyRow cols={7} message='No heat records. Click "Add Heat Record" to get started.' />
                      ) : heatRecords.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-semibold">{r.animalName}</TableCell>
                          <TableCell>{formatDate(r.date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={intensityColor[r.intensity] ?? ""}>{r.intensity}</Badge>
                          </TableCell>
                          <TableCell>{r.detectedBy}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span>{formatDate(r.nextExpectedHeat)}</span>
                              {daysUntil(r.nextExpectedHeat) >= 0 && daysUntil(r.nextExpectedHeat) <= 5 && (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px]">Soon</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.notes || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteHeat(r.id, r.animalName)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ BREEDING ═══ */}
        <TabsContent value="breeding" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Syringe className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base">Breeding Records (AI / Natural)</CardTitle>
              </div>
              <Button size="sm" onClick={() => openDialog("breeding")}>
                <Plus className="h-4 w-4 mr-1" />Add Breeding
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading.breeding ? <SectionLoader /> : errors.breeding ? (
                <p className="text-sm text-destructive p-4">{errors.breeding}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.nav.buffalo}</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Semen / Bull</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Conception</TableHead>
                        <TableHead>Cost (₹)</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breedingRecords.length === 0 ? (
                        <EmptyRow cols={9} message='No breeding records. Click "Add Breeding" to get started.' />
                      ) : breedingRecords.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-semibold">{r.animalName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={r.type === "AI" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}>
                              {r.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(r.date)}</TableCell>
                          <TableCell>{r.semenBull || "—"}</TableCell>
                          <TableCell>{r.technician || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={conceptionColor[r.conception] ?? ""}>{r.conception}</Badge>
                          </TableCell>
                          <TableCell>{r.cost > 0 ? `₹ ${r.cost.toLocaleString()}` : "—"}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{r.notes || "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => deleteBreeding(r.id, r.animalName)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ PREGNANCY ═══ */}
        <TabsContent value="pregnancy" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Baby className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-base">Pregnancy & Expected Calving</CardTitle>
              </div>
              <Button size="sm" onClick={() => openDialog("pregnancy")}>
                <Plus className="h-4 w-4 mr-1" />Add Pregnancy
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading.pregnancy ? <SectionLoader /> : errors.pregnancy ? (
                <p className="text-sm text-destructive p-4">{errors.pregnancy}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.nav.buffalo}</TableHead>
                        <TableHead>Conception Date</TableHead>
                        <TableHead>Expected Calving</TableHead>
                        <TableHead>Dry Period Start</TableHead>
                        <TableHead>Days Remaining</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Diagnosed By</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pregnancyRecords.length === 0 ? (
                        <EmptyRow cols={8} message='No pregnancy records. Click "Add Pregnancy" to get started.' />
                      ) : pregnancyRecords.map((r) => {
                        const remaining = daysUntil(r.expectedCalving);
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-semibold">{r.animalName}</TableCell>
                            <TableCell>{formatDate(r.conceptionDate)}</TableCell>
                            <TableCell>{formatDate(r.expectedCalving)}</TableCell>
                            <TableCell>{formatDate(r.dryPeriodStart)}</TableCell>
                            <TableCell>
                              {r.status === "Active" && remaining >= 0 ? (
                                <span className={`font-semibold text-sm ${remaining <= 14 ? "text-red-600" : remaining <= 30 ? "text-amber-600" : "text-foreground"}`}>
                                  {remaining} days
                                </span>
                              ) : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor[r.status] ?? ""}>{r.status}</Badge>
                            </TableCell>
                            <TableCell>{r.diagnosedBy || "—"}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => deletePregnancy(r.id, r.animalName)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ LACTATION ═══ */}
        <TabsContent value="lactation" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle className="text-base">Lactation Cycle & Days in Milk</CardTitle>
              </div>
              <Button size="sm" onClick={() => openDialog("lactation")}>
                <Plus className="h-4 w-4 mr-1" />Add Lactation
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading.lactation ? <SectionLoader /> : errors.lactation ? (
                <p className="text-sm text-destructive p-4">{errors.lactation}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.nav.buffalo}</TableHead>
                        <TableHead>Calving Date</TableHead>
                        <TableHead>Lactation #</TableHead>
                        <TableHead>Days in Milk</TableHead>
                        <TableHead>Expected Dry Date</TableHead>
                        <TableHead>Peak Yield</TableHead>
                        <TableHead>305-Day Yield</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lactationRecords.length === 0 ? (
                        <EmptyRow cols={9} message='No lactation cycles. Click "Add Lactation" to get started.' />
                      ) : lactationRecords.map((r) => {
                        const dryIn = daysUntil(r.expectedDryDate);
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-semibold">{r.animalName}</TableCell>
                            <TableCell>{formatDate(r.calvingDate)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">#{r.lactationNumber}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${r.daysInMilk > 300 ? "text-amber-600" : "text-foreground"}`}>
                                {r.daysInMilk} DIM
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {formatDate(r.expectedDryDate)}
                                {r.status === "Active" && dryIn >= 0 && dryIn <= 14 && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">Soon</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{r.peakYield ? `${r.peakYield} L` : "—"}</TableCell>
                            <TableCell>{r.totalYield305 ? `${r.totalYield305} L` : <span className="text-muted-foreground text-xs">In progress</span>}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor[r.status] ?? ""}>{r.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => deleteLactation(r.id, r.animalName)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ANALYTICS ═══ */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Conception Rate</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{conceptionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{conceptionYes} of {totalBreeding} attempts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Avg. Days in Milk</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{avgDIM}</p>
                <p className="text-xs text-muted-foreground mt-1">Across {activeLactations} active lactations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Repeat Breeders</p>
                </div>
                <p className="text-3xl font-bold text-red-500">{repeatBreeders}</p>
                <p className="text-xs text-muted-foreground mt-1">Animals with ≥2 failed breedings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Baby className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Total Calvings</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{totalBirths}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed pregnancies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Female Calf Rate</p>
                </div>
                <p className="text-3xl font-bold text-pink-600">
                  {totalBirths > 0 ? Math.round((femaleBirths / totalBirths) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{femaleBirths} female of {totalBirths} calves</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Active Pregnancies</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">{activePregnancies}</p>
                <p className="text-xs text-muted-foreground mt-1">Currently pregnant animals</p>
              </CardContent>
            </Card>
          </div>

          {/* Breeding summary table */}
          {breedingRecords.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Breeding Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Animal</TableHead>
                        <TableHead>Total Breedings</TableHead>
                        <TableHead>Successful</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Success Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(new Set(breedingRecords.map((b) => b.animalName))).map((name) => {
                        const records = breedingRecords.filter((b) => b.animalName === name);
                        const yes  = records.filter((b) => b.conception === "Yes").length;
                        const no   = records.filter((b) => b.conception === "No").length;
                        const pend = records.filter((b) => b.conception === "Pending").length;
                        const rate = records.length > 0 ? Math.round((yes / records.length) * 100) : 0;
                        return (
                          <TableRow key={name}>
                            <TableCell className="font-semibold">{name}</TableCell>
                            <TableCell>{records.length}</TableCell>
                            <TableCell><span className="text-emerald-600 font-semibold">{yes}</span></TableCell>
                            <TableCell><span className="text-red-500 font-semibold">{no}</span></TableCell>
                            <TableCell><span className="text-amber-600 font-semibold">{pend}</span></TableCell>
                            <TableCell>
                              <Badge variant="outline" className={rate >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : rate >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}>
                                {rate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════ DIALOGS ══════════════════════════ */}

      {/* ── Add Heat Record ── */}
      <Dialog open={activeDialog === "heat"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
          <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Thermometer className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Add Heat Record</p>
              <p className="text-slate-400 text-xs">Record heat detection for an animal</p>
            </div>
          </div>
          <div className="px-6 py-5">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div>}
            <form onSubmit={submitHeat} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Animal Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Radha" value={hAnimal} onChange={(e) => setHAnimal(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Detection Date <span className="text-destructive">*</span></Label>
                  <Input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Intensity</Label>
                  <Select value={hIntensity} onValueChange={setHIntensity}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mild">Mild</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Detected By</Label>
                  <Select value={hBy} onValueChange={setHBy}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual / Visual</SelectItem>
                      <SelectItem value="Pedometer">Pedometer</SelectItem>
                      <SelectItem value="Tail Paint">Tail Paint</SelectItem>
                      <SelectItem value="Teaser Bull">Teaser Bull</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional observations…" value={hNotes} onChange={(e) => setHNotes(e.target.value)} className="rounded-xl h-10" />
                </div>
              </div>
              {hDate && <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-2.5 flex justify-between items-center">
                <span className="text-xs text-pink-700 font-medium">Next Expected Heat</span>
                <span className="text-sm font-bold text-pink-700">
                  {formatDate(new Date(new Date(hDate).getTime() + 21 * 86400000).toISOString().split("T")[0])}
                </span>
              </div>}
              <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Heat Record</>}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Breeding Record ── */}
      <Dialog open={activeDialog === "breeding"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
          <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Syringe className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Add Breeding Record</p>
              <p className="text-slate-400 text-xs">Record AI or natural breeding</p>
            </div>
          </div>
          <div className="px-6 py-5">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div>}
            <form onSubmit={submitBreeding} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Animal Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Sundari" value={bAnimal} onChange={(e) => setBAnimal(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Breeding Type</Label>
                  <Select value={bType} onValueChange={setBType}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI">AI (Artificial Insemination)</SelectItem>
                      <SelectItem value="Natural">Natural Mating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Date <span className="text-destructive">*</span></Label>
                  <Input type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>{bType === "AI" ? "Semen (Bull / Straw ID)" : "Bull Name"}</Label>
                  <Input placeholder={bType === "AI" ? "Semen straw ID or bull" : "Bull name"} value={bBull} onChange={(e) => setBBull(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Technician / Doctor</Label>
                  <Input placeholder="Name" value={bTech} onChange={(e) => setBTech(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Conception Result</Label>
                  <Select value={bConception} onValueChange={setBConception}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Yes">Yes — Conceived</SelectItem>
                      <SelectItem value="No">No — Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Cost (₹)</Label>
                  <Input type="number" min={0} placeholder="0" value={bCost} onChange={(e) => setBCost(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Notes</Label>
                  <Input placeholder="Optional…" value={bNotes} onChange={(e) => setBNotes(e.target.value)} className="rounded-xl h-10" />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Breeding Record</>}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Pregnancy Record ── */}
      <Dialog open={activeDialog === "pregnancy"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
          <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Baby className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Add Pregnancy Record</p>
              <p className="text-slate-400 text-xs">Expected calving auto-calculated (+285 days)</p>
            </div>
          </div>
          <div className="px-6 py-5">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div>}
            <form onSubmit={submitPregnancy} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Animal Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Ganga" value={pAnimal} onChange={(e) => setPAnimal(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Conception / Confirmation Date <span className="text-destructive">*</span></Label>
                  <Input type="date" value={pConceptionDate} onChange={(e) => setPConceptionDate(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Diagnosed By (Vet / Doctor)</Label>
                  <Input placeholder="Dr. Patel" value={pDiagnosedBy} onChange={(e) => setPDiagnosedBy(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional…" value={pNotes} onChange={(e) => setPNotes(e.target.value)} className="rounded-xl h-10" />
                </div>
              </div>
              {pConceptionDate && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs text-purple-700 font-medium">Expected Calving</span>
                    <span className="text-sm font-bold text-purple-700">
                      {formatDate(new Date(new Date(pConceptionDate).getTime() + 285 * 86400000).toISOString().split("T")[0])}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-purple-700 font-medium">Dry Period Start</span>
                    <span className="text-sm font-bold text-purple-700">
                      {formatDate(new Date(new Date(pConceptionDate).getTime() + (285 - 60) * 86400000).toISOString().split("T")[0])}
                    </span>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Pregnancy Record</>}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Lactation ── */}
      <Dialog open={activeDialog === "lactation"} onOpenChange={(o) => !o && setActiveDialog(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
          <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Add Lactation Cycle</p>
              <p className="text-slate-400 text-xs">Days in milk auto-calculated from calving date</p>
            </div>
          </div>
          <div className="px-6 py-5">
            {formError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</div>}
            <form onSubmit={submitLactation} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Animal Name <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Lakshmi" value={lAnimal} onChange={(e) => setLAnimal(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Calving Date <span className="text-destructive">*</span></Label>
                  <Input type="date" value={lCalvingDate} onChange={(e) => setLCalvingDate(e.target.value)} className="rounded-xl h-10" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Lactation Number</Label>
                  <Input type="number" min={1} placeholder="1" value={lLactationNo} onChange={(e) => setLLactationNo(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Peak Yield (L/day)</Label>
                  <Input type="number" min={0} step={0.1} placeholder="0" value={lPeakYield} onChange={(e) => setLPeakYield(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Calf Tag / ID</Label>
                  <Input placeholder="Optional" value={lCalfId} onChange={(e) => setLCalfId(e.target.value)} className="rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional…" value={lNotes} onChange={(e) => setLNotes(e.target.value)} className="rounded-xl h-10" />
                </div>
              </div>
              {lCalvingDate && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-xs text-emerald-700 font-medium">Expected Dry Date (305 DIM)</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {formatDate(new Date(new Date(lCalvingDate).getTime() + 305 * 86400000).toISOString().split("T")[0])}
                  </span>
                </div>
              )}
              <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Lactation Cycle</>}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
