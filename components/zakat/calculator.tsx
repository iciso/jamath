// components/zakat/calculator.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const NISAB_GOLD = 85    // grams
const NISAB_SILVER = 595 // grams
const GOLD_PRICE = 7500  // INR per gram
const SILVER_PRICE = 90  // INR per gram

export function ZakatCalculator() {
  const [assets, setAssets] = useState({
    cash: 0,
    gold: 0,
    silver: 0,
    business: 0,
    debtsOwed: 0,
  })

  const totalWealth = 
    assets.cash +
    (assets.gold * GOLD_PRICE) +
    (assets.silver * SILVER_PRICE) +
    assets.business +
    assets.debtsOwed

  const nisab = Math.min(NISAB_GOLD * GOLD_PRICE, NISAB_SILVER * SILVER_PRICE)
  const zakat = totalWealth >= nisab ? totalWealth * 0.025 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zakat Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Cash & Savings (₹)</label>
            <Input type="number" value={assets.cash} onChange={(e) => setAssets({...assets, cash: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Gold (grams)</label>
            <Input type="number" value={assets.gold} onChange={(e) => setAssets({...assets, gold: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Silver (grams)</label>
            <Input type="number" value={assets.silver} onChange={(e) => setAssets({...assets, silver: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Business Assets (₹)</label>
            <Input type="number" value={assets.business} onChange={(e) => setAssets({...assets, business: +e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Debts Owed to You (₹)</label>
            <Input type="number" value={assets.debtsOwed} onChange={(e) => setAssets({...assets, debtsOwed: +e.target.value})} />
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg space-y-2 border border-green-200">
          <p><strong>Total Wealth:</strong> ₹{totalWealth.toFixed(2)}</p>
          <p><strong>Nisab Threshold:</strong> ₹{nisab.toFixed(2)}</p>
          <p className="text-lg font-bold text-green-700">
            Zakat Due: <span className="text-2xl">₹{zakat.toFixed(2)}</span>
          </p>
          {totalWealth < nisab && (
            <p className="text-sm text-amber-700">No Zakat due (below Nisab)</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
