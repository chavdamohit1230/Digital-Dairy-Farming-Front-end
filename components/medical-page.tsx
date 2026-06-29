"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  Plus, Stethoscope, Syringe, CalendarClock, IndianRupee, AlertTriangle, Trash2, RefreshCw, Loader2, AlertCircle 
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MedicalRecord {
  id: string;
  buffaloId: string;
  buffaloName: string;
  type: string;
  date: string;
  description: string;
  doctor: string;
  cost: number;
  nextDue: string;
}

interface Buffalo {
  id: string;
  name: string;
}

const typeColors: Record<string, string> = {
  Vaccination: "bg-blue-50 text-blue-700 border-blue-200",
  Deworming: "bg-amber-50 text-amber-700 border-amber-200",
  Treatment: "bg-red-50 text-red-700 border-red-200",
  Checkup: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function MedicalPage() {
  const { t } = useI18n();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [buffaloId, setBuffaloId] = useState("");
  const [type, setType] = useState("Vaccination");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [doctor, setDoctor] = useState("");
  const [nextDue, setNextDue] = useState("");

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const [medRes, animRes] = await Promise.all([
        fetch("/api/medical"),
        fetch("/api/animals")
      ]);
      const medData = await medRes.json();
      const animData = await animRes.json();
      
      if (medData.success) setMedicalRecords(medData.data);
      else setFetchError(medData.message || "Failed to load medical records.");

      if (animData.success) {
        setBuffaloes(animData.data.map((a: any) => ({ id: a.id, name: a.name })));
      }
    } catch {
      setFetchError("Cannot reach the database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Submit Handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!buffaloId || !date || !type) {
      setFormError("Buffalo, type, and date are required.");
      return;
    }

    const selectedBuffalo = buffaloes.find(b => b.id === buffaloId);
    if (!selectedBuffalo) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buffaloId,
          buffaloName: selectedBuffalo.name,
          type,
          date,
          description,
          cost: cost ? Number(cost) : 0,
          doctor,
          nextDue
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddDialog(false);
        resetForm();
        fetchAll();
      } else {
        setFormError(data.message || "Failed to save record.");
      }
    } catch {
      setFormError("Cannot reach the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBuffaloId("");
    setType("Vaccination");
    setDate("");
    setDescription("");
    setCost("");
    setDoctor("");
    setNextDue("");
    setFormError("");
  };

  // ─── Delete Handler ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string, desc: string) => {
    if (!window.confirm(`Delete record: "${desc}"?`)) return;
    try {
      const res = await fetch(`/api/medical?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMedicalRecords(prev => prev.filter(r => r.id !== id));
      } else {
        alert(data.message || "Failed to delete.");
      }
    } catch {
      alert("Cannot reach the database.");
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const totalMedicalCost = medicalRecords.reduce((s, r) => s + r.cost, 0);
  const upcomingVacc = medicalRecords.filter((r) => r.type === "Vaccination" && r.nextDue).length;
  const treatments = medicalRecords.filter((r) => r.type === "Treatment").length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.health.title}</h1>
          <p className="text-sm text-muted-foreground">Track treatments, vaccinations, and health expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAll} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
            <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> {t.common.add} Record</Button>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">Dialog</DialogTitle>
              {/* Slate Header */}
              <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">Add Medical Record</p>
                  <p className="text-slate-400 text-xs">Record health treatments & vaccinations</p>
                </div>
              </div>
              <div className="px-6 py-5">
                {formError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
                    <AlertCircle className="h-4 w-4 shrink-0" />{formError}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>{t.nav.buffalo} <span className="text-destructive">*</span></Label>
                    <Select value={buffaloId} onValueChange={setBuffaloId}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Select animal" /></SelectTrigger>
                      <SelectContent>
                        {buffaloes.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Type <span className="text-destructive">*</span></Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vaccination">{t.health.vaccination}</SelectItem>
                          <SelectItem value="Deworming">{t.health.deworming}</SelectItem>
                          <SelectItem value="Treatment">{t.health.treatment}</SelectItem>
                          <SelectItem value="Checkup">Checkup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Date <span className="text-destructive">*</span></Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Description / Diagnosis</Label>
                    <Input placeholder="Description of treatment" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Cost (₹)</Label>
                      <Input type="number" min={0} placeholder="0" value={cost} onChange={(e) => setCost(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Doctor</Label>
                      <Input placeholder="Doctor name" value={doctor} onChange={(e) => setDoctor(e.target.value)} className="rounded-xl h-10" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Next Due Date (optional)</Label>
                    <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><Plus className="h-4 w-4 mr-2" />Save Record</>}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading from database…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{fetchError}</p>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                  <p className="text-xl font-bold">{medicalRecords.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Syringe className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Upcoming Vacc.</p>
                  <p className="text-xl font-bold">{upcomingVacc}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Treatments</p>
                  <p className="text-xl font-bold">{treatments}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold">₹ {totalMedicalCost.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Upcoming Schedule ── */}
          {medicalRecords.filter((r) => r.nextDue).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CalendarClock className="h-4 w-4 text-emerald-600" />
                  </div>
                  <CardTitle className="text-base">Upcoming Schedule</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {medicalRecords.filter((r) => r.nextDue)
                    .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())
                    .map((r) => (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 border border-border rounded-xl gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-foreground">{r.buffaloName}</p>
                          <Badge variant="outline" className={typeColors[r.type] || ""}>
                            {r.type === "Vaccination" ? t.health.vaccination :
                             r.type === "Deworming" ? t.health.deworming :
                             r.type === "Treatment" ? t.health.treatment : r.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.description || "Follow up check"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md shrink-0">
                        <CalendarClock className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">Due: {new Date(r.nextDue).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Records Table ── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-base">Medical History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>{t.nav.buffalo}</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                          No medical records. Click &quot;Add Record&quot; to get started.
                        </TableCell>
                      </TableRow>
                    ) : medicalRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                        <TableCell className="font-semibold">{r.buffaloName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeColors[r.type] || ""}>
                            {r.type === "Vaccination" ? t.health.vaccination :
                             r.type === "Deworming" ? t.health.deworming :
                             r.type === "Treatment" ? t.health.treatment : r.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={r.description}>{r.description || "—"}</TableCell>
                        <TableCell>{r.doctor || "—"}</TableCell>
                        <TableCell>{r.cost > 0 ? `₹ ${r.cost.toLocaleString()}` : "—"}</TableCell>
                        <TableCell>
                          {r.nextDue ? (
                             <span className="text-sm font-medium">{new Date(r.nextDue).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(r.id, `${r.type} on ${r.date}`)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
