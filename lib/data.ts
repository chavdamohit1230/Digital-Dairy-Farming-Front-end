// Mock data for the Dairy Farm Management Application

export type UserRole = "admin" | "manager" | "worker" | "accountant"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string
}

export type BuffaloStatus = "Lactating" | "Dry" | "Pregnant" | "Sick"
export type AnimalStage = "Calf" | "Heifer" | "Pregnant" | "Lactating" | "Dry" | "Sick" | "Sold" | "Dead"

export interface Buffalo {
  id: string
  name: string
  tagNumber: string
  qrCodeData?: string
  breed: string
  age: number
  weight: number
  status: BuffaloStatus
  stage?: AnimalStage
  bodyScore?: number
  purchaseDate: string
  purchaseCost: number
  source: string
  motherId?: string
  fatherId?: string
  dateOfBirth?: string
  bloodline?: string
  lactationStart?: string
  lactationEnd?: string
  milkYieldPerDay: number
  fatPercentage: number
  pregnancyDate?: string
  deliveryDate?: string
  lastHeatDate?: string
  nextVaccination?: string
  insurance?: string
  soldAt?: string
  deathDate?: string
}

export interface MilkEntry {
  id: string
  buffaloId: string
  buffaloName: string
  date: string
  morningQty: number
  eveningQty: number
  totalQty: number
  fatPercent: number
  snfPercent: number
}

export interface FeedEntry {
  id: string
  type: "Green Fodder" | "Dry Fodder" | "Concentrate" | "Mineral Mix"
  name: string
  stock: number
  unit: string
  costPerKg: number
  lowStockThreshold: number
}

export interface MedicalRecord {
  id: string
  buffaloId: string
  buffaloName: string
  type: "Vaccination" | "Deworming" | "Treatment" | "Checkup"
  date: string
  description: string
  cost: number
  nextDue?: string
  doctor?: string
}

export interface Worker {
  id: string
  name: string
  role: string
  salary: number
  phone: string
  joinDate: string
  shift: "Morning" | "Evening" | "Full Day"
  attendance: number
  advance: number
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  date: string
  description: string
}

export interface Loan {
  id: string
  source: string
  amount: number
  interestRate: number
  emiAmount: number
  emiDueDate: string
  totalPaid: number
  remainingBalance: number
  startDate: string
}

// Demo Users
export const users: User[] = [
  { id: "1", name: "Mohit Chavda", email: "admin@dairyfarm.com", role: "admin", phone: "+91 98765 43210" },
  { id: "2", name: "Suresh Kumar", email: "manager@dairyfarm.com", role: "manager", phone: "+91 98765 43211" },
  { id: "3", name: "Ramesh Bhai", email: "worker@dairyfarm.com", role: "worker", phone: "+91 98765 43212" },
  { id: "4", name: "Mahesh Shah", email: "accountant@dairyfarm.com", role: "accountant", phone: "+91 98765 43213" },
]

// Buffalo Data
export const buffaloes: Buffalo[] = [
  { id: "BUF001", name: "Lakshmi", tagNumber: "RFID-001", breed: "Murrah", age: 5, weight: 550, status: "Lactating", purchaseDate: "2023-03-15", purchaseCost: 95000, source: "Hisar Mandi", lactationStart: "2025-11-01", milkYieldPerDay: 14, fatPercentage: 7.2, nextVaccination: "2026-03-15", insurance: "Active" },
  { id: "BUF002", name: "Gauri", tagNumber: "RFID-002", breed: "Murrah", age: 4, weight: 520, status: "Lactating", purchaseDate: "2023-06-20", purchaseCost: 88000, source: "Anand Market", lactationStart: "2025-12-10", milkYieldPerDay: 12, fatPercentage: 7.0, nextVaccination: "2026-04-20" },
  { id: "BUF003", name: "Sundari", tagNumber: "RFID-003", breed: "Murrah", age: 6, weight: 580, status: "Pregnant", purchaseDate: "2022-08-10", purchaseCost: 102000, source: "Local Farm", milkYieldPerDay: 0, fatPercentage: 0, pregnancyDate: "2025-10-15", deliveryDate: "2026-07-15", nextVaccination: "2026-05-10" },
  { id: "BUF004", name: "Kamla", tagNumber: "RFID-004", breed: "Murrah", age: 3, weight: 490, status: "Lactating", purchaseDate: "2024-01-05", purchaseCost: 92000, source: "Mehsana Market", lactationStart: "2025-10-20", milkYieldPerDay: 11, fatPercentage: 6.8, nextVaccination: "2026-03-05" },
  { id: "BUF005", name: "Radha", tagNumber: "RFID-005", breed: "Murrah", age: 7, weight: 600, status: "Dry", purchaseDate: "2021-05-12", purchaseCost: 85000, source: "Hisar Mandi", milkYieldPerDay: 0, fatPercentage: 0, lastHeatDate: "2026-01-20", nextVaccination: "2026-06-12" },
  { id: "BUF006", name: "Savitri", tagNumber: "RFID-006", breed: "Murrah", age: 4, weight: 510, status: "Lactating", purchaseDate: "2023-09-01", purchaseCost: 90000, source: "Anand Market", lactationStart: "2025-09-15", milkYieldPerDay: 13, fatPercentage: 7.1, nextVaccination: "2026-03-01" },
  { id: "BUF007", name: "Parvati", tagNumber: "RFID-007", breed: "Murrah", age: 5, weight: 540, status: "Sick", purchaseDate: "2023-02-18", purchaseCost: 93000, source: "Local Farm", milkYieldPerDay: 5, fatPercentage: 6.5, nextVaccination: "2026-02-18" },
  { id: "BUF008", name: "Sita", tagNumber: "RFID-008", breed: "Murrah", age: 3, weight: 480, status: "Lactating", purchaseDate: "2024-04-22", purchaseCost: 96000, source: "Mehsana Market", lactationStart: "2025-12-01", milkYieldPerDay: 10, fatPercentage: 6.9, nextVaccination: "2026-04-22" },
  { id: "BUF009", name: "Ganga", tagNumber: "RFID-009", breed: "Murrah", age: 6, weight: 570, status: "Pregnant", purchaseDate: "2022-11-30", purchaseCost: 98000, source: "Hisar Mandi", milkYieldPerDay: 0, fatPercentage: 0, pregnancyDate: "2025-11-20", deliveryDate: "2026-08-20", nextVaccination: "2026-05-30" },
  { id: "BUF010", name: "Durga", tagNumber: "RFID-010", breed: "Murrah", age: 4, weight: 530, status: "Lactating", purchaseDate: "2023-07-14", purchaseCost: 91000, source: "Anand Market", lactationStart: "2025-11-25", milkYieldPerDay: 15, fatPercentage: 7.5, nextVaccination: "2026-07-14", insurance: "Active" },
]

// Milk Entries for today
export const milkEntries: MilkEntry[] = [
  { id: "M001", buffaloId: "BUF001", buffaloName: "Lakshmi", date: "2026-02-17", morningQty: 7.5, eveningQty: 6.5, totalQty: 14, fatPercent: 7.2, snfPercent: 9.1 },
  { id: "M002", buffaloId: "BUF002", buffaloName: "Gauri", date: "2026-02-17", morningQty: 6.5, eveningQty: 5.5, totalQty: 12, fatPercent: 7.0, snfPercent: 9.0 },
  { id: "M003", buffaloId: "BUF004", buffaloName: "Kamla", date: "2026-02-17", morningQty: 6.0, eveningQty: 5.0, totalQty: 11, fatPercent: 6.8, snfPercent: 8.9 },
  { id: "M004", buffaloId: "BUF006", buffaloName: "Savitri", date: "2026-02-17", morningQty: 7.0, eveningQty: 6.0, totalQty: 13, fatPercent: 7.1, snfPercent: 9.0 },
  { id: "M005", buffaloId: "BUF007", buffaloName: "Parvati", date: "2026-02-17", morningQty: 3.0, eveningQty: 2.0, totalQty: 5, fatPercent: 6.5, snfPercent: 8.5 },
  { id: "M006", buffaloId: "BUF008", buffaloName: "Sita", date: "2026-02-17", morningQty: 5.5, eveningQty: 4.5, totalQty: 10, fatPercent: 6.9, snfPercent: 8.8 },
  { id: "M007", buffaloId: "BUF010", buffaloName: "Durga", date: "2026-02-17", morningQty: 8.0, eveningQty: 7.0, totalQty: 15, fatPercent: 7.5, snfPercent: 9.2 },
]

// Feed Inventory
export const feedInventory: FeedEntry[] = [
  { id: "F001", type: "Green Fodder", name: "Napier Grass", stock: 2500, unit: "kg", costPerKg: 3, lowStockThreshold: 500 },
  { id: "F002", type: "Green Fodder", name: "Maize Silage", stock: 1800, unit: "kg", costPerKg: 5, lowStockThreshold: 400 },
  { id: "F003", type: "Dry Fodder", name: "Wheat Straw", stock: 3000, unit: "kg", costPerKg: 4, lowStockThreshold: 600 },
  { id: "F004", type: "Dry Fodder", name: "Rice Straw", stock: 150, unit: "kg", costPerKg: 3.5, lowStockThreshold: 300 },
  { id: "F005", type: "Concentrate", name: "Dairy Feed", stock: 800, unit: "kg", costPerKg: 28, lowStockThreshold: 200 },
  { id: "F006", type: "Concentrate", name: "Cotton Seed Cake", stock: 400, unit: "kg", costPerKg: 35, lowStockThreshold: 100 },
  { id: "F007", type: "Mineral Mix", name: "Mineral Mixture", stock: 50, unit: "kg", costPerKg: 120, lowStockThreshold: 20 },
  { id: "F008", type: "Mineral Mix", name: "Salt Lick", stock: 30, unit: "kg", costPerKg: 80, lowStockThreshold: 10 },
]

// Medical Records
export const medicalRecords: MedicalRecord[] = [
  { id: "MR001", buffaloId: "BUF001", buffaloName: "Lakshmi", type: "Vaccination", date: "2025-09-15", description: "FMD Vaccination", cost: 250, nextDue: "2026-03-15", doctor: "Dr. Sharma" },
  { id: "MR002", buffaloId: "BUF007", buffaloName: "Parvati", type: "Treatment", date: "2026-02-10", description: "Mastitis Treatment", cost: 1500, doctor: "Dr. Sharma" },
  { id: "MR003", buffaloId: "BUF003", buffaloName: "Sundari", type: "Checkup", date: "2026-01-20", description: "Pregnancy Checkup - Confirmed", cost: 500, doctor: "Dr. Patel" },
  { id: "MR004", buffaloId: "BUF005", buffaloName: "Radha", type: "Deworming", date: "2026-01-05", description: "Deworming Treatment", cost: 200, nextDue: "2026-04-05", doctor: "Dr. Sharma" },
  { id: "MR005", buffaloId: "BUF002", buffaloName: "Gauri", type: "Vaccination", date: "2025-10-20", description: "Brucellosis Vaccine", cost: 300, nextDue: "2026-04-20", doctor: "Dr. Patel" },
  { id: "MR006", buffaloId: "BUF009", buffaloName: "Ganga", type: "Checkup", date: "2026-02-01", description: "Pregnancy Checkup - Month 3", cost: 500, doctor: "Dr. Patel" },
]

// Workers
export const workers: Worker[] = [
  { id: "W001", name: "Ramesh Bhai", role: "Milking", salary: 15000, phone: "+91 98765 43212", joinDate: "2022-01-10", shift: "Morning", attendance: 26, advance: 2000 },
  { id: "W002", name: "Sunil Kumar", role: "Feeding", salary: 12000, phone: "+91 98765 43220", joinDate: "2022-06-15", shift: "Full Day", attendance: 28, advance: 0 },
  { id: "W003", name: "Vijay Singh", role: "Cleaning", salary: 10000, phone: "+91 98765 43221", joinDate: "2023-03-01", shift: "Morning", attendance: 24, advance: 5000 },
  { id: "W004", name: "Arjun Patel", role: "Milking", salary: 15000, phone: "+91 98765 43222", joinDate: "2023-08-20", shift: "Evening", attendance: 27, advance: 0 },
  { id: "W005", name: "Dinesh Yadav", role: "Helper", salary: 8000, phone: "+91 98765 43223", joinDate: "2024-01-05", shift: "Full Day", attendance: 25, advance: 1000 },
]

// Financial Transactions
export const transactions: Transaction[] = [
  { id: "T001", type: "income", category: "Milk Sales", amount: 4800, date: "2026-02-17", description: "Morning milk sold to Amul" },
  { id: "T002", type: "income", category: "Milk Sales", amount: 3600, date: "2026-02-17", description: "Evening milk sold to Amul" },
  { id: "T003", type: "expense", category: "Feed", amount: 2200, date: "2026-02-17", description: "Daily feed purchase" },
  { id: "T004", type: "expense", category: "Labour", amount: 2000, date: "2026-02-17", description: "Daily wages" },
  { id: "T005", type: "expense", category: "Medicine", amount: 1500, date: "2026-02-17", description: "Parvati treatment" },
  { id: "T006", type: "income", category: "Manure Sales", amount: 800, date: "2026-02-16", description: "Manure sold" },
  { id: "T007", type: "expense", category: "Electricity", amount: 450, date: "2026-02-15", description: "Monthly electricity" },
  { id: "T008", type: "expense", category: "Maintenance", amount: 600, date: "2026-02-14", description: "Milking machine repair" },
  { id: "T009", type: "income", category: "Milk Sales", amount: 4500, date: "2026-02-16", description: "Full day milk sales" },
  { id: "T010", type: "income", category: "Milk Sales", amount: 4200, date: "2026-02-15", description: "Full day milk sales" },
]

// Loans
export const loans: Loan[] = [
  { id: "L001", source: "SBI Bank", amount: 500000, interestRate: 7.5, emiAmount: 9875, emiDueDate: "2026-03-05", totalPaid: 177750, remainingBalance: 322250, startDate: "2024-09-05" },
  { id: "L002", source: "NABARD Subsidy Loan", amount: 200000, interestRate: 4.0, emiAmount: 3540, emiDueDate: "2026-03-10", totalPaid: 63720, remainingBalance: 136280, startDate: "2024-07-10" },
]

// Dashboard Summary
export const dashboardData = {
  totalBuffalo: 10,
  lactating: 6,
  dry: 1,
  pregnant: 2,
  sick: 1,
  todayMilk: 80,
  monthMilk: 2160,
  todayIncome: 8400,
  todayExpense: 5700,
  todayProfit: 2700,
  monthProfit: 72900,
  avgMilkPerBuffalo: 13.3,
  bestPerformer: "Durga (15 L/day)",
  avgFatPercent: 7.0,
}

// Daily milk data for charts (last 7 days)
export const dailyMilkData = [
  { day: "Feb 11", morning: 38, evening: 34, total: 72 },
  { day: "Feb 12", morning: 40, evening: 36, total: 76 },
  { day: "Feb 13", morning: 42, evening: 37, total: 79 },
  { day: "Feb 14", morning: 41, evening: 35, total: 76 },
  { day: "Feb 15", morning: 39, evening: 36, total: 75 },
  { day: "Feb 16", morning: 43, evening: 38, total: 81 },
  { day: "Feb 17", morning: 43.5, evening: 36.5, total: 80 },
]

// Monthly Income vs Expense
export const monthlyFinanceData = [
  { month: "Sep", income: 210000, expense: 155000, profit: 55000 },
  { month: "Oct", income: 225000, expense: 160000, profit: 65000 },
  { month: "Nov", income: 218000, expense: 152000, profit: 66000 },
  { month: "Dec", income: 235000, expense: 158000, profit: 77000 },
  { month: "Jan", income: 240000, expense: 165000, profit: 75000 },
  { month: "Feb", income: 248000, expense: 170000, profit: 78000 },
]

// Upcoming alerts
export const alerts = [
  { id: 1, type: "vaccination", message: "Lakshmi - FMD Vaccination due on Mar 15", severity: "warning" as const },
  { id: 2, type: "vaccination", message: "Parvati - Vaccination overdue since Feb 18", severity: "error" as const },
  { id: 3, type: "delivery", message: "Sundari - Expected delivery: Jul 15, 2026", severity: "info" as const },
  { id: 4, type: "delivery", message: "Ganga - Expected delivery: Aug 20, 2026", severity: "info" as const },
  { id: 5, type: "heat", message: "Radha - Heat detected on Jan 20", severity: "warning" as const },
  { id: 6, type: "stock", message: "Rice Straw stock critically low (150 kg)", severity: "error" as const },
  { id: 7, type: "emi", message: "SBI Bank EMI due on Mar 5 - Rs 9,875", severity: "warning" as const },
  { id: 8, type: "medical", message: "Parvati - Follow up checkup needed", severity: "warning" as const },
]

// Role permissions
export const rolePermissions: Record<UserRole, string[]> = {
  admin: ["dashboard", "buffalo", "milk", "feed", "reproduction", "medical", "labour", "finance", "loans", "inventory", "reports", "settings"],
  manager: ["dashboard", "buffalo", "milk", "feed", "reproduction", "medical", "labour", "inventory", "reports"],
  worker: ["dashboard", "milk", "feed", "medical"],
  accountant: ["dashboard", "finance", "loans", "reports", "labour"],
}
