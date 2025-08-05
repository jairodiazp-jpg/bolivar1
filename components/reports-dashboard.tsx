"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, FileText, Download, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react"

interface ReportsProps {
  userType: "admin" | "empresa"
  companyId?: number
}

export default function ReportsDashboard({ userType, companyId }: ReportsProps) {
  const [reportType, setReportType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!reportType) return

    setIsGenerating(true)

    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(companyId && { companyId: companyId.toString() }),
      })

      const response = await fetch(`/api/reports?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error("Error generating report")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const reportTypes = [
    {
      id: "appointments",
      name: "Reporte de Citas",
      description: "Listado completo de citas médicas con filtros por fecha y estado",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      id: "professionals",
      name: "Reporte de Profesionales",
      description: "Estado, rendimiento y estadísticas de profesionales médicos",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "metrics",
      name: "Reporte de Métricas",
      description: "Indicadores clave de rendimiento (KPIs) del sistema",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    ...(userType === "admin"
      ? [
          {
            id: "financial",
            name: "Reporte Financiero",
            description: "Análisis detallado de ingresos, gastos y rentabilidad",
            icon: DollarSign,
            color: "bg-yellow-500",
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              reportType === report.id ? "ring-2 ring-green-500 bg-green-50" : ""
            }`}
            onClick={() => setReportType(report.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}>
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Configuración del Reporte</span>
          </CardTitle>
          <CardDescription>Configura los parámetros para generar tu reporte personalizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {reportType ? (
                <span>
                  Generando: <strong>{reportTypes.find((r) => r.id === reportType)?.name}</strong>
                  {startDate && endDate && (
                    <span>
                      {" "}
                      del {startDate} al {endDate}
                    </span>
                  )}
                </span>
              ) : (
                "Selecciona un tipo de reporte para continuar"
              )}
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={!reportType || isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generar PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Reportes Rápidos</span>
          </CardTitle>
          <CardDescription>Genera reportes predefinidos con un solo clic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              onClick={() => {
                setReportType("appointments")
                setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
                setEndDate(new Date().toISOString().split("T")[0])
                setTimeout(handleGenerateReport, 100)
              }}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Citas Última Semana</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              onClick={() => {
                setReportType("appointments")
                setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
                setEndDate(new Date().toISOString().split("T")[0])
                setTimeout(handleGenerateReport, 100)
              }}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Citas Este Mes</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              onClick={() => {
                setReportType("professionals")
                setStartDate("")
                setEndDate("")
                setTimeout(handleGenerateReport, 100)
              }}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Todos los Profesionales</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              onClick={() => {
                setReportType("metrics")
                setStartDate("")
                setEndDate("")
                setTimeout(handleGenerateReport, 100)
              }}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Métricas del Sistema</span>
            </Button>

            {userType === "admin" && (
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                onClick={() => {
                  setReportType("financial")
                  setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
                  setEndDate(new Date().toISOString().split("T")[0])
                  setTimeout(handleGenerateReport, 100)
                }}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Financiero Mensual</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
