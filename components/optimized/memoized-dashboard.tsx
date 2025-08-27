"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalAppointments: number
    todayAppointments: number
    confirmedAppointments: number
    activeProfessionals: number
    confirmationRate: number
    lastUpdated: string
  }
}

const StatCard = memo(
  ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
  }: {
    title: string
    value: string | number
    icon: any
    trend?: number
    color?: string
  }) => {
    const trendColor = useMemo(() => {
      if (!trend) return "gray"
      return trend > 0 ? "green" : trend < 0 ? "red" : "gray"
    }, [trend])

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              <TrendingUp className={`h-3 w-3 text-${trendColor}-500 mr-1`} />
              <span className={`text-xs text-${trendColor}-500`}>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

StatCard.displayName = "StatCard"

const MemoizedDashboard = memo(({ stats }: DashboardStatsProps) => {
  const formattedStats = useMemo(
    () => [
      {
        title: "Total de Citas",
        value: stats.totalAppointments.toLocaleString(),
        icon: Calendar,
        trend: 12,
        color: "blue",
      },
      {
        title: "Citas Hoy",
        value: stats.todayAppointments.toLocaleString(),
        icon: Clock,
        trend: 8,
        color: "green",
      },
      {
        title: "Profesionales Activos",
        value: stats.activeProfessionals.toLocaleString(),
        icon: Users,
        trend: 3,
        color: "purple",
      },
      {
        title: "Tasa de Confirmación",
        value: `${stats.confirmationRate}%`,
        icon: TrendingUp,
        trend: 5,
        color: "orange",
      },
    ],
    [stats],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Badge variant="outline" className="text-xs">
          Actualizado: {new Date(stats.lastUpdated).toLocaleTimeString()}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {formattedStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  )
})

MemoizedDashboard.displayName = "MemoizedDashboard"

export default MemoizedDashboard
