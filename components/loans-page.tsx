"use client"

import { loans } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Landmark, IndianRupee, CalendarClock, AlertTriangle, Plus } from "lucide-react"

export function LoansPage() {
  const totalLoan = loans.reduce((s, l) => s + l.amount, 0)
  const totalRemaining = loans.reduce((s, l) => s + l.remainingBalance, 0)
  const totalPaid = loans.reduce((s, l) => s + l.totalPaid, 0)
  const monthlyEMI = loans.reduce((s, l) => s + l.emiAmount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Loans & Subsidy</h1>
          <p className="text-sm text-muted-foreground">Track loans, EMIs, and government subsidies</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Loan</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center shrink-0">
              <Landmark className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Loans</p>
              <p className="text-xl font-bold text-card-foreground">Rs {totalLoan.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold text-primary">Rs {totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-destructive">Rs {totalRemaining.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center shrink-0">
              <CalendarClock className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly EMI</p>
              <p className="text-xl font-bold text-card-foreground">Rs {monthlyEMI.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.map((loan) => {
          const paidPercent = (loan.totalPaid / loan.amount) * 100
          return (
            <Card key={loan.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-card-foreground">{loan.source}</CardTitle>
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Loan Amount</p>
                    <p className="font-semibold text-card-foreground">Rs {loan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-semibold text-card-foreground">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">EMI Amount</p>
                    <p className="font-semibold text-card-foreground">Rs {loan.emiAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next EMI Due</p>
                    <p className="font-semibold text-chart-3">{loan.emiDueDate}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Repayment Progress</span>
                    <span className="font-medium text-card-foreground">{paidPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={paidPercent} className="[&>div]:bg-primary" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Paid: Rs {loan.totalPaid.toLocaleString()}</span>
                    <span>Remaining: Rs {loan.remainingBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Started: {loan.startDate}</span>
                  <Button variant="outline" size="sm">Pay EMI</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
