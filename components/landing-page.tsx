"use client"

import { useState } from "react"
import {
  Milk, Activity, Heart, Wheat, BarChart3,
  Users, ArrowRight, Sparkles, TrendingUp, CheckCircle2,
  ShieldCheck, AlertTriangle, ChevronDown, Plus, Minus,
  Star, ArrowUpRight, Search, FileText
} from "lucide-react"

interface LandingPageProps {
  onOpenLogin: () => void
}

export function LandingPage({ onOpenLogin }: LandingPageProps) {
  // State for FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  // State for Billing Period
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const stats = [
    { value: "142k+", label: "Animals Tracked", desc: "Across commercial enterprises" },
    { value: "8.2M Litres", label: "Milk Logged Annually", desc: "Automated ledger records" },
    { value: "99.4%", label: "Vaccination Compliance", desc: "With automated SMS alerts" },
    { value: "34%", label: "Feed Margin Increase", desc: "Via customized ration plans" }
  ]

  const bentoFeatures = [
    {
      span: "lg:col-span-2",
      icon: <Activity className="h-6 w-6 text-[#15803d]" />,
      title: "Pedigree & Lifecycle Tracking",
      description: "Log breeding details, mother/father lineages, dry/lactation cycles, and veterinary visits. Build individual profiles using RFID tags and automated QR codes.",
      badge: "RFID Ready"
    },
    {
      span: "lg:col-span-1",
      icon: <ShieldCheck className="h-6 w-6 text-[#15803d]" />,
      title: "Smart Alert Engine",
      description: "Receive high-priority warnings for upcoming heat periods, overdue vaccinations, expected calving times, and monthly loan EMIs.",
      badge: "Alerts Engine"
    },
    {
      span: "lg:col-span-1",
      icon: <Wheat className="h-6 w-6 text-[#15803d]" />,
      title: "Feed Nutrition Optimizer",
      description: "Create custom ration recipes (Green grass, wheat straw, mineral mixes) designed to maximize Murrah milk fat percentages.",
      badge: "Ration Planner"
    },
    {
      span: "lg:col-span-2",
      icon: <TrendingUp className="h-6 w-6 text-[#15803d]" />,
      title: "Enterprise Accounting & Ledgers",
      description: "Automatically log milk revenues, calculate labor wages, match feed receipts, and compile cash-flow balances. Export audit-ready reports in Excel or PDF in seconds.",
      badge: "Ledger Auditing"
    }
  ]

  const testimonials = [
    {
      stars: 5,
      quote: "Digital Dairy changed our operational oversight. We saw a 14% yield increase and a massive reduction in deworming delays during our first quarter of implementation.",
      name: "Mohit Chavda",
      role: "Owner, Patel Dairy Enterprise",
      initials: "MC",
      bgColor: "bg-green-100 text-[#15803d]"
    },
    {
      stars: 5,
      quote: "Standardizing worker checklists on a single platform keeps our labor shifts synced. The feed inventory optimizer alone saved us over ₹45,000 last month.",
      name: "Suresh Kumar",
      role: "Manager, Anand Dairy Cooperatives",
      initials: "SK",
      bgColor: "bg-green-50 text-emerald-700"
    },
    {
      stars: 5,
      quote: "The financial logs are simple and clean. Our auditors love the formatted PDF ledger exports, and tracking EMI cycles has never been easier.",
      name: "Mahesh Shah",
      role: "Chief Accountant, Saurashtra Breeders",
      initials: "MS",
      bgColor: "bg-slate-100 text-slate-700"
    }
  ]

  const pricingPlans = [
    {
      name: "Starter License",
      price: "₹0",
      desc: "For small family farms stepping into digital tracking.",
      features: [
        "Up to 5 Buffalo Profiles",
        "Manual Milk Yield Logs",
        "Basic Vaccination Reminders",
        "Single User Account"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Professional Plan",
      price: billingPeriod === "monthly" ? "₹1,499" : "₹1,199",
      period: "/month",
      yearlyLabel: billingPeriod === "annually" ? "billed annually (Save 20%)" : undefined,
      desc: "Designed for commercial breeders scaling yield quality.",
      features: [
        "Up to 50 Buffalo Profiles",
        "RFID & QR Profile Printing",
        "AI Ration Feed Optimizer",
        "Financial Ledger & PDF Exports",
        "3 Worker/Accountant seats"
      ],
      cta: "Get Started Pro",
      popular: true
    },
    {
      name: "Enterprise Custom",
      price: "Custom",
      period: "",
      desc: "Full multi-farm management with dedicated accounting controls.",
      features: [
        "Unlimited Buffalo Profiles",
        "Multi-Farm Dashboard Sync",
        "Custom API Integrations",
        "Auditor Ledger Reconciliation",
        "Priority Support & Setup"
      ],
      cta: "Contact Enterprise",
      popular: false
    }
  ]

  const faqs = [
    {
      q: "Does this platform support offline entries in rural environments?",
      a: "Yes. Our client application caches milk records, veterinary logs, and feed stocks locally. As soon as a connection is detected, details sync securely to the online MongoDB database."
    },
    {
      q: "Is it easy for daily farm workers to log morning and evening milking details?",
      a: "Absolutely. The worker interface is built with simplified icons and text, optimized for both mobile screens and rural usability, supporting English, Hindi, and Gujarati."
    },
    {
      q: "Can we manage salary advances and attendance sheets for our staff?",
      a: "Yes. The Labour & HR module allows you to track worker shifts (morning, evening, full day), calculate daily payrolls, record cash advances, and generate monthly salary slips."
    },
    {
      q: "How secure is our financial data?",
      a: "We implement industry-standard database encryption and JWT authentication tokens. Only authorized accounts with Owner/Admin roles can access financial charts and export ledger sheets."
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#15803d] selection:text-white overflow-x-hidden relative">
      
      {/* ───────── Top Navigation Header ───────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#15803d] shadow-sm">
              <Milk className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#15803d] sm:text-xl">
              Digital Dairy
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#15803d] transition-colors">Features</a>
            <a href="#stats" className="hover:text-[#15803d] transition-colors">Impact</a>
            <a href="#pricing" className="hover:text-[#15803d] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#15803d] transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#15803d] hover:bg-[#166534] transition-all cursor-pointer rounded-lg shadow-sm hover:shadow-md"
            >
              Dashboard Login
            </button>
          </div>
        </div>
      </header>

      {/* ───────── Hero Section ───────── */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 bg-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Subtle radial spotlights (No grids) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[5%] left-[5%] w-[500px] h-[500px] rounded-full bg-green-200/30 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-emerald-200/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4.5 py-1 text-xs sm:text-sm font-semibold text-[#15803d] mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#15803d] animate-pulse" />
              <span>The Operating System for Dairy Enterprises</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-7xl leading-[1.05] mb-8 animate-slide-up">
              Streamline Milk Yields, Ledgers, and Herd Lifecycle Management
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Ditch manual registers. Audit milk sales, track veterinary checkups, schedule heat alerts, and manage employee ledger balances in one secure database system.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto relative overflow-hidden group inline-flex items-center justify-center gap-2 rounded-lg bg-[#15803d] px-8 py-4 text-base font-bold text-white hover:bg-[#166534] hover:shadow-lg active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-md"
              >
                {/* Sliding shine glare effect */}
                <span className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                Start Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                Book Enterprise Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <p className="text-xs font-semibold text-slate-400 mt-10 uppercase tracking-widest">
              Trusted by 1,200+ Commercial Dairy Operations • MongoDB Cloud Security
            </p>
          </div>

          {/* Premium Mock Dashboard Screenshot integration */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {/* Window header */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
              </div>
              <span className="text-xs text-slate-500 font-medium tracking-tight">digital_dairy_farming_dashboard.io</span>
              <div className="w-8" />
            </div>

            {/* Mock Dashboard Body */}
            <div className="flex flex-col lg:flex-row h-[460px] lg:h-[500px]">
              {/* Mock Sidebar (Solid Green sidebar matching screenshots) */}
              <div className="w-full lg:w-56 bg-[#15803d] text-white p-5 flex flex-col justify-between border-r border-green-800 shrink-0">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 border-b border-green-800/60 pb-4">
                    <div className="h-8 w-8 rounded bg-white/15 flex items-center justify-center">
                      <Milk className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none">Patel Dairy Farm</p>
                      <p className="text-[10px] text-green-200 mt-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Admin Mode
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs font-medium">
                    <span className="px-3 py-2 rounded bg-white/10 font-bold flex items-center justify-between cursor-default">
                      <span className="flex items-center gap-2"><Activity className="h-4 w-4" /> Dashboard</span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                    </span>
                    <span className="px-3 py-2 rounded text-green-100 hover:bg-white/5 flex items-center gap-2 cursor-default"><Milk className="h-4 w-4" /> Milk Production</span>
                    <span className="px-3 py-2 rounded text-green-100 hover:bg-white/5 flex items-center gap-2 cursor-default"><Wheat className="h-4 w-4" /> Feed inventory</span>
                    <span className="px-3 py-2 rounded text-green-100 hover:bg-white/5 flex items-center gap-2 cursor-default"><Heart className="h-4 w-4" /> Breeding log</span>
                    <span className="px-3 py-2 rounded text-green-100 hover:bg-white/5 flex items-center gap-2 cursor-default"><TrendingUp className="h-4 w-4" /> Financials</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-green-800/40 text-[10px] text-green-200">
                  <p>Database: digitalityfarming</p>
                  <p className="mt-0.5 opacity-60">Status: Connected</p>
                </div>
              </div>

              {/* Mock Dashboard Main Content */}
              <div className="flex-1 bg-slate-50 p-6 overflow-y-auto flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Operational Summary (Live Sync)</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time indicators compiled from online MongoDB cloud</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-400 text-[10px]">RFID Tag Query</span>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Buffaloes", val: "10", color: "text-slate-900", icon: <Users className="h-4 w-4 text-slate-400" /> },
                    { label: "Lactating Stage", val: "6", color: "text-[#15803d]", icon: <Milk className="h-4 w-4 text-[#15803d]" /> },
                    { label: "Daily Yield Avg", val: "80 L", color: "text-[#15803d]", icon: <BarChart3 className="h-4 w-4 text-[#15803d]" /> },
                    { label: "Today Net Profit", val: "₹2,700", color: "text-[#15803d]", icon: <TrendingUp className="h-4 w-4 text-[#15803d]" /> }
                  ].map((c, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{c.label}</p>
                        <p className={`text-base font-extrabold mt-1 ${c.color}`}>{c.val}</p>
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-100">{c.icon}</div>
                    </div>
                  ))}
                </div>

                {/* Milking chart details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                  <div className="lg:col-span-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-slate-700">Weekly Milk Yield (Litres)</p>
                      <span className="text-[9px] text-[#15803d] bg-green-50 border border-green-200 px-2 py-0.5 rounded font-bold">Today: 80L</span>
                    </div>
                    <div className="flex items-end justify-between h-28 pt-2">
                      {[70, 74, 78, 75, 74, 81, 80].map((h, idx) => (
                        <div key={idx} className="w-8 bg-slate-50 rounded-t flex flex-col justify-end" style={{ height: '100%' }}>
                          <div className="w-full bg-[#15803d] rounded-t transition-all hover:bg-[#166534] cursor-pointer" style={{ height: `${h}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                    <p className="text-xs font-bold text-slate-700 mb-2">Alert Center</p>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-700 shadow-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-bold leading-tight">Vaccination Overdue</p>
                          <p className="text-[10px] text-amber-600 mt-0.5">Parvati tag checkup needed</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-start bg-green-50 border border-green-200 p-2.5 rounded text-[11px] text-[#15803d] shadow-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15803d] mt-0.5" />
                        <div>
                          <p className="font-bold leading-tight">EMI Paid Successfully</p>
                          <p className="text-[10px] text-green-700 mt-0.5">₹9,875 to SBI Bank</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Impact Statistics Section ───────── */}
      <section id="stats" className="py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center md:border-r last:border-0 border-slate-200/60 pr-4 last:pr-0">
                <p className="text-4xl sm:text-5xl font-extrabold text-[#15803d] tracking-tight mb-1">{s.value}</p>
                <p className="text-sm font-bold text-slate-900 mb-0.5">{s.label}</p>
                <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Bento-Style Feature Grid ───────── */}
      <section id="features" className="py-28 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight mb-4">
              Engineered for Precision Farm Management
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Standardize record-keeping and financial accountability across workers and accountants. Get clear visual data logs on your computer screen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {bentoFeatures.map((f, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-[#15803d]/45 hover:-translate-y-1.5 hover:shadow-xl ${f.span} flex flex-col justify-between`}
              >
                <div>
                  {/* Accent top bar */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-[#15803d] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="h-11 w-11 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shadow-sm group-hover:bg-[#15803d]/10 transition-colors">
                      {f.icon}
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {f.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#15803d] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {f.description}
                  </p>
                </div>

                {/* Sub-visualizations for Bento Cards */}
                {idx === 0 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] gap-2">
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-xs">Mother: Sundari</span>
                      <span className="text-slate-400 font-bold">→</span>
                      <span className="font-bold text-[#15803d] bg-green-50 border border-green-200 px-2.5 py-1 rounded shadow-xs">Buffalo: Parvati</span>
                      <span className="text-slate-400 font-bold">←</span>
                      <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-xs">Father: Ganga-M1</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 border-t border-slate-200/60 pt-2 font-medium">
                      <span>RFID: 120048992</span>
                      <span className="text-[#15803d] font-bold">Lactation: Stage 2</span>
                    </div>
                  </div>
                )}

                {idx === 1 && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[11px] text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                      <span className="font-bold">Heat Alert:</span> Kaali tag #24 overdue 2 days
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-bold">Vaccination:</span> Anthrax due in 4 days
                    </div>
                  </div>
                )}

                {idx === 2 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-2.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>Daily Ration Recipe</span>
                      <span className="text-[#15803d]">Balanced Pro Mix</span>
                    </div>
                    <div className="space-y-2 mt-1">
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                          <span>Green Napier Grass</span>
                          <span>60%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#15803d] rounded-full" style={{ width: "60%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                          <span>Concentrates (Cottonseed)</span>
                          <span>30%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "30%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {idx === 3 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">
                      <span>Recent Cash Flow</span>
                      <span className="text-[#15803d]">Reconciled</span>
                    </div>
                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-[11px] bg-white p-2 rounded border border-slate-100 shadow-xs">
                        <span className="text-slate-600">Amul Center Milk (80L)</span>
                        <span className="font-bold text-[#15803d]">+₹5,000</span>
                      </div>
                      <div className="flex justify-between text-[11px] bg-white p-2 rounded border border-slate-100 shadow-xs">
                        <span className="text-slate-600">Labour Wages (Shift)</span>
                        <span className="font-bold text-rose-600">-₹1,200</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Feature Showcase (Alternating Layouts) ───────── */}
      <section className="py-28 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-28">
          
          {/* Showcase Item 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <span className="text-xs font-bold text-[#15803d] uppercase tracking-widest">Reproduction Lifecycle</span>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl leading-tight tracking-tight">
                Minimize Dry Periods with Artificial Insemination Logs
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Monitor your buffalo's reproductive statuses. Maintain entries for heat cycles, Conception Checks, and expected delivery/calving countdowns. Avoid gaps in milking cycles with pre-scheduled alerts.
              </p>
            </div>
            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-lg mx-auto w-full">
              <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Breeding Details - Sundari</span>
                  <span className="h-2 w-2 rounded-full bg-[#15803d] animate-ping" />
                </p>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Breed Type</span>
                  <span className="font-bold text-slate-700">AI Insemination</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Semen Batch</span>
                  <span className="font-bold text-slate-700">MURRAH-SM89</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Pregnancy Diagnosis</span>
                  <span className="font-bold text-[#15803d]">Confirmed (Month 4)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Expected Calving</span>
                  <span className="font-bold text-[#15803d]">July 15, 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase Item 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 lg:order-2 flex flex-col gap-6">
              <span className="text-xs font-bold text-[#15803d] uppercase tracking-widest">Milking Analytics</span>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl leading-tight tracking-tight">
                Log FAT & SNF Quality to Reconcile Milk Revenues
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Log morning and evening yields on a unified interface. Automatically compute the average FAT and SNF percentage payouts based on collection center rates, helping you forecast revenues before Amul invoicing.
              </p>
            </div>
            <div className="lg:col-span-6 lg:order-1 bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-lg mx-auto w-full">
              <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Milking Yield Logs - Today</span>
                  <span className="text-[10px] text-slate-400">Feb 17</span>
                </p>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Yield</span>
                  <span className="font-bold text-slate-800">80 Litres</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Fat Average</span>
                  <span className="font-bold text-[#15803d]">7.10%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Reconciled Rate</span>
                  <span className="font-bold text-slate-800">₹62.50 / Litre</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Expected Payout</span>
                  <span className="font-bold text-[#15803d]">₹5,000</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ───────── Customer Testimonials Section ───────── */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight mb-4">
              Endorsed by Top Dairy Enterprises
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Read how commercial buffalo farm operations organize their daily bookkeeping workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="group bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all hover:border-[#15803d]/30 hover:shadow-md duration-300"
              >
                <div>
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4 mt-2">
                  <div className={`h-9 w-9 rounded-full ${t.bgColor} flex items-center justify-center text-xs font-bold shadow-inner`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Pricing License Section ───────── */}
      <section id="pricing" className="py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight mb-4">
              Subscription Plans
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Choose a license matching your farm scale. Change tiers at any time.
            </p>
          </div>

          {/* Billing Switcher Toggle */}
          <div className="flex items-center justify-center gap-3.5 mb-14">
            <span className={`text-sm font-semibold transition-colors ${billingPeriod === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
              Billed Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
              className="relative w-11 h-6 rounded-full bg-slate-200 p-0.5 transition-colors duration-200 outline-hidden cursor-pointer"
              aria-label="Toggle billing period"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 flex items-center justify-center ${
                  billingPeriod === "annually" ? "translate-x-5" : "translate-x-0"
                }`}
                style={{
                  backgroundColor: billingPeriod === "annually" ? "#15803d" : "#ffffff"
                }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${billingPeriod === "annually" ? "text-slate-900" : "text-slate-400"}`}>
              Billed Annually
              <span className="text-[10px] bg-green-100 text-[#15803d] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Save 20%
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((p, idx) => (
              <div
                key={idx}
                className={`bg-white p-8 rounded-xl border flex flex-col justify-between relative transition-all hover:scale-[1.01] duration-300 ${
                  p.popular 
                    ? "border-[#15803d] shadow-md hover:shadow-lg hover:shadow-green-800/[0.05]" 
                    : "border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#15803d] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-slate-900 transition-all duration-300">{p.price}</span>
                    <span className="text-sm text-slate-500">{p.period}</span>
                  </div>
                  {p.yearlyLabel && (
                    <p className="text-[10px] text-[#15803d] font-bold -mt-3 mb-4 animate-fade-in">{p.yearlyLabel}</p>
                  )}
                  <p className="text-xs text-slate-500 mb-6">{p.desc}</p>
                  
                  <div className="h-px bg-slate-200 mb-6" />
                  
                  <ul className="text-xs text-slate-600 space-y-3.5 mb-8">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#15803d] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onOpenLogin}
                  className={`w-full py-3.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    p.popular
                      ? "bg-[#15803d] hover:bg-[#166534] text-white shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ Accordion Section ───────── */}
      <section id="faq" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Everything you need to know about setting up your database logs.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-left hover:bg-slate-50 transition-colors text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <Minus className="h-4 w-4 text-[#15803d] shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 text-[#15803d] shrink-0" />
                  )}
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final Call to Action Section ───────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-[#15803d] rounded-2xl p-12 text-center text-white relative overflow-hidden shadow-xl shadow-green-950/15">
            {/* Subtle glow spotlights (No grids) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-white/20 blur-[80px]" />
              <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] rounded-full bg-white/10 blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-5 leading-tight">
                Upgrade Your Farm Operations Today
              </h2>
              <p className="text-green-100 text-sm sm:text-base mb-10 max-w-lg leading-relaxed">
                Connect your farm registers to the cloud database. Audit milk yields, track vaccinations, and monitor accounting sheets in real time.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto relative overflow-hidden group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-bold text-[#15803d] hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  <span className="absolute inset-0 w-full h-full bg-[#15803d]/5 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  Open Live Dashboard
                </button>
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  Schedule Setup Call
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Modern Sitemap Footer ───────── */}
      <footer className="bg-[#14532d] text-slate-200 py-16 relative overflow-hidden border-t border-[#166534]">
        {/* Subtle radial spotlight inside footer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute bottom-0 right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-400/20 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Product</h4>
              <ul className="text-xs text-green-100/70 space-y-3">
                <li><a href="#features" className="hover:text-emerald-300 transition-colors">Milk Yield Log</a></li>
                <li><a href="#features" className="hover:text-emerald-300 transition-colors">Herd Database</a></li>
                <li><a href="#features" className="hover:text-emerald-300 transition-colors">AI Ration Optimizer</a></li>
                <li><a href="#features" className="hover:text-emerald-300 transition-colors">Financial Ledger</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Resources</h4>
              <ul className="text-xs text-green-100/70 space-y-3">
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Knowledge Base</span></li>
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Video Guides</span></li>
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Murrah Breed Spec</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Company</h4>
              <ul className="text-xs text-green-100/70 space-y-3">
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">About Us</span></li>
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Careers</span></li>
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Partner Program</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Legal</h4>
              <ul className="text-xs text-green-100/70 space-y-3">
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Privacy Policy</span></li>
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Terms of Service</span></li>
                <li><span className="cursor-default hover:text-emerald-300 transition-colors">Data Agreement</span></li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-green-800/60 my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-green-100/50">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-white shadow-sm">
                <Milk className="h-4.5 w-4.5 text-[#15803d]" />
              </div>
              <span className="font-bold text-white">Digital Dairy Farming</span>
            </div>
            <p>© 2026 Digital Dairy Farming. All Rights Reserved. Enterprise Edition.</p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(25px, -30px) scale(1.03); }
          66% { transform: translate(-15px, 15px) scale(0.97); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-blob {
          animation: blob 8s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  )
}
