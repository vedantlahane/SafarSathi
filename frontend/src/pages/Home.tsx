import { useState, useEffect } from "react"
import { QrCode, Map, Receipt, ShieldAlert } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/* ================= TYPES ================= */

type AlertType = "Alert" | "Info"

type AlertItem = {
  id: number
  type: AlertType
  message: string
  time: string
}

type SafetyLog = {
  id: number
  action: string
  timestamp: string
  verified: boolean
}

/* ================= MOCK ================= */

const mockAlerts: AlertItem[] = []

const mockSafetyLogs: SafetyLog[] = [
 
]

/* ================= COMPONENT ================= */

export default function Home() {
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const stored = localStorage.getItem("alerts")
    return stored ? JSON.parse(stored) : mockAlerts
  })

  const [safetyLogs, setSafetyLogs] = useState<SafetyLog[]>(() => {
    const stored = localStorage.getItem("safetyLogs")
    return stored ? JSON.parse(stored) : mockSafetyLogs
  })

  const [showSafetyLogs, setShowSafetyLogs] = useState(false)

  const [safetyScore, setSafetyScore] = useState(94);
localStorage.clear()
  useEffect(() => {
    localStorage.setItem("alerts", JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem("safetyLogs", JSON.stringify(safetyLogs))
  }, [safetyLogs])

  return (
    <div className="min-h-screen">
      

      {/* MAIN */}
      <main className="flex flex-col gap-6 py-6 pb-32">
        {/* SAFETY SCORE */}
        <Card className="relative overflow-hidden border-none bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <CardContent className="relative p-4">
            <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-6 rounded-full bg-white/10 blur-2xl" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">
                  Dynamic Safety Score
                </p>
                <h3 className="text-3xl font-bold leading-tight">{safetyScore}</h3>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                <ShieldAlert className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="mt-3 flex gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-white/20 px-2.5 py-1">
                Safe Zone
              </span>
              <span className="rounded-full bg-black/20 px-2.5 py-1">
                Civil Lines
              </span>
            </div>
          </CardContent>

          <div className="border-t border-white/20 px-4 py-3">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold">5-Minute Trend</span>
              <Badge className="bg-success/20 text-success">
                +2% Stable
              </Badge>
            </div>

            <svg viewBox="0 0 300 60" className="h-16 w-full">
              <defs>
                <linearGradient
                  id="trendGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M0 40 C 20 38, 40 45, 60 35 S 100 20, 140 25 S 200 40, 240 15 S 280 10, 300 12"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />

              <path
                d="M0 40 C 20 38, 40 45, 60 35 S 100 20, 140 25 S 200 40, 240 15 S 280 10, 300 12 V 60 H 0 Z"
                fill="url(#trendGradient)"
              />
            </svg>
          </div>
        </Card>

        {/* ALERTS / QUICK ACTIONS */}
        <section className="space-y-3">
          {alerts.length === 0 ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-4 flex flex-col items-center gap-2">
                  <QrCode className="h-6 w-6" />
                  <p className="text-xs font-medium">Scan QR</p>
                </Card>

                <Card className="p-4 flex flex-col items-center gap-2">
                  <Map className="h-6 w-6" />
                  <p className="text-xs font-medium">Map</p>
                </Card>
              </div>

              <Card className="border-dashed">
                <CardContent className="p-4 text-center text-[12px] text-muted-foreground">
                  No active alerts. You’re all set.
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Active Alerts</span>
                <Badge variant="secondary">{alerts.length}</Badge>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {alerts.map((alert) => {
                  const color =
                    alert.type === "Alert"
                      ? "text-yellow-600"
                      : "text-blue-600"

                  return (
                    <Card key={alert.id} className="shadow-sm">
                      <CardContent className="flex items-start gap-3 p-3">
                        <div className="rounded-full bg-blue-50 p-2">
                          <ShieldAlert className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <h4
                              className={cn(
                                "text-[13px] font-semibold",
                                color
                              )}
                            >
                              {alert.type}
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                              {alert.time}
                            </span>
                          </div>

                          <p className="text-[12px] text-muted-foreground">
                            {alert.message}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </section>

        {/* SAFETY LOGS TOGGLE */}
        <section>
          <button
            className="text-xs text-text-secondary"
            onClick={() => setShowSafetyLogs((s) => !s)}
          >
            {showSafetyLogs ? "Hide" : "Show"} safety logs
          </button>
        </section>

        {showSafetyLogs && (
          <section className="space-y-2">
            {safetyLogs.map((log) => (
              <Card key={log.id} className="shadow-sm">
                <CardContent className="flex items-start gap-3 p-3">
                  <div className="rounded-full bg-blue-50 p-2">
                    <Receipt className="h-4 w-4 text-blue-600" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <h5 className="text-[13px] font-semibold text-blue-700">
                        {log.action}
                      </h5>
                      <span className="text-[11px] text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>

                    {log.verified && (
                      <Badge className="text-xs bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
