import jsPDF from "jspdf"
import "jspdf-autotable"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ReportData {
  title: string
  subtitle?: string
  data: any[]
  columns: { header: string; dataKey: string; width?: number }[]
  summary?: { label: string; value: string | number }[]
  filters?: { label: string; value: string }[]
}

export function generatePDFReport(reportData: ReportData): jsPDF {
  const doc = new jsPDF()

  // Configuración de colores corporativos
  const primaryColor = [21, 128, 61] // Verde
  const secondaryColor = [234, 179, 8] // Amarillo
  const textColor = [55, 65, 81] // Gris oscuro
  const lightGray = [249, 250, 251] // Gris claro

  // Header con logo simulado
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 25, "F")

  // Logo simulado
  doc.setFillColor(255, 255, 255)
  doc.circle(15, 12.5, 8, "F")
  doc.setTextColor(21, 128, 61)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("🏥", 11, 16)

  // Título principal
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("MediSchedule", 30, 12)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Sistema de Agendamiento Médico", 30, 18)

  // Título del reporte
  doc.setTextColor(...textColor)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(reportData.title, 20, 40)

  let yPosition = 50

  // Subtítulo
  if (reportData.subtitle) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(107, 114, 128)
    doc.text(reportData.subtitle, 20, yPosition)
    yPosition += 10
  }

  // Fecha de generación
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(
    `Generado el: ${new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    20,
    yPosition,
  )
  yPosition += 5

  // Filtros aplicados
  if (reportData.filters && reportData.filters.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    reportData.filters.forEach((filter) => {
      yPosition += 5
      doc.text(`${filter.label}: ${filter.value}`, 20, yPosition)
    })
  }

  // Línea separadora
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.line(20, yPosition + 5, 190, yPosition + 5)
  yPosition += 15

  // Sección de resumen
  if (reportData.summary && reportData.summary.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...textColor)
    doc.text("📊 Resumen Ejecutivo", 20, yPosition)
    yPosition += 10

    // Crear cajas de resumen
    const summaryBoxWidth = 40
    const summaryBoxHeight = 20
    let xPosition = 20

    reportData.summary.forEach((item, index) => {
      if (index > 0 && index % 4 === 0) {
        yPosition += summaryBoxHeight + 10
        xPosition = 20
      }

      // Caja de resumen
      doc.setFillColor(...lightGray)
      doc.rect(xPosition, yPosition, summaryBoxWidth, summaryBoxHeight, "F")
      doc.setDrawColor(229, 231, 235)
      doc.rect(xPosition, yPosition, summaryBoxWidth, summaryBoxHeight, "S")

      // Etiqueta
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.setFont("helvetica", "normal")
      doc.text(item.label, xPosition + 2, yPosition + 6)

      // Valor
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.setFont("helvetica", "bold")
      const valueText = String(item.value)
      const textWidth = doc.getTextWidth(valueText)
      doc.text(valueText, xPosition + summaryBoxWidth - textWidth - 2, yPosition + 15)

      xPosition += summaryBoxWidth + 5
    })

    yPosition += summaryBoxHeight + 20
  }

  // Tabla principal
  if (reportData.data.length > 0) {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...textColor)
    doc.text("📋 Datos Detallados", 20, yPosition)
    yPosition += 10

    // Configurar columnas con anchos
    const columns = reportData.columns.map((col) => ({
      header: col.header,
      dataKey: col.dataKey,
      width: col.width || "auto",
    }))

    doc.autoTable({
      startY: yPosition,
      head: [columns.map((col) => col.header)],
      body: reportData.data.map((row) =>
        columns.map((col) => {
          const value = row[col.dataKey]
          if (value === null || value === undefined) return ""
          if (typeof value === "object" && value instanceof Date) {
            return value.toLocaleDateString("es-ES")
          }
          return String(value)
        }),
      ),
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = {
          cellWidth: col.width === "auto" ? "auto" : col.width,
          halign: typeof reportData.data[0]?.[col.dataKey] === "number" ? "right" : "left",
        }
        return acc
      }, {} as any),
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
      },
    })
  }

  // Footer en todas las páginas
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Línea del footer
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(20, doc.internal.pageSize.height - 20, 190, doc.internal.pageSize.height - 20)

    // Texto del footer
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.setFont("helvetica", "normal")
    doc.text(
      `MediSchedule © ${new Date().getFullYear()} - Sistema de Agendamiento Médico`,
      20,
      doc.internal.pageSize.height - 12,
    )

    // Número de página
    doc.text(
      `Página ${i} de ${pageCount}`,
      190 - doc.getTextWidth(`Página ${i} de ${pageCount}`),
      doc.internal.pageSize.height - 12,
    )
  }

  return doc
}

export function generateAppointmentsReport(appointments: any[], dateRange?: { start: string; end: string }) {
  const reportData: ReportData = {
    title: "Reporte de Citas Médicas",
    subtitle: dateRange ? `Período: ${dateRange.start} - ${dateRange.end}` : "Todas las citas registradas",
    data: appointments.map((apt) => ({
      ...apt,
      date: new Date(apt.date).toLocaleDateString("es-ES"),
      statusText: apt.status === "confirmed" ? "Confirmada" : apt.status === "pending" ? "Pendiente" : "Cancelada",
    })),
    columns: [
      { header: "Fecha", dataKey: "date", width: 25 },
      { header: "Hora", dataKey: "time", width: 20 },
      { header: "Paciente", dataKey: "patientName", width: 35 },
      { header: "Profesional", dataKey: "doctorName", width: 35 },
      { header: "Especialidad", dataKey: "specialty", width: 30 },
      { header: "Estado", dataKey: "statusText", width: 25 },
      { header: "Tipo", dataKey: "type", width: 25 },
    ],
    summary: [
      { label: "Total de citas", value: appointments.length },
      { label: "Confirmadas", value: appointments.filter((a) => a.status === "confirmed").length },
      { label: "Pendientes", value: appointments.filter((a) => a.status === "pending").length },
      { label: "Canceladas", value: appointments.filter((a) => a.status === "cancelled").length },
    ],
    filters: dateRange
      ? [
          { label: "Fecha inicio", value: dateRange.start },
          { label: "Fecha fin", value: dateRange.end },
        ]
      : [],
  }

  return generatePDFReport(reportData)
}

export function generateProfessionalsReport(professionals: any[]) {
  const reportData: ReportData = {
    title: "Reporte de Profesionales Médicos",
    subtitle: "Estado actual de profesionales registrados en el sistema",
    data: professionals.map((prof) => ({
      ...prof,
      statusText: prof.status === "active" ? "Activo" : "Inactivo",
      ratingText: prof.rating ? `${prof.rating}/5.0` : "N/A",
    })),
    columns: [
      { header: "Nombre", dataKey: "name", width: 40 },
      { header: "Especialidad", dataKey: "specialty", width: 30 },
      { header: "Email", dataKey: "email", width: 45 },
      { header: "Empresa", dataKey: "companyName", width: 35 },
      { header: "Horas/Sem", dataKey: "weeklyHours", width: 20 },
      { header: "Estado", dataKey: "statusText", width: 20 },
      { header: "Rating", dataKey: "ratingText", width: 20 },
    ],
    summary: [
      { label: "Total profesionales", value: professionals.length },
      { label: "Activos", value: professionals.filter((p) => p.status === "active").length },
      { label: "Inactivos", value: professionals.filter((p) => p.status === "inactive").length },
      {
        label: "Promedio horas/semana",
        value:
          professionals.length > 0
            ? Math.round(professionals.reduce((acc, p) => acc + (p.weeklyHours || 0), 0) / professionals.length)
            : 0,
      },
    ],
  }

  return generatePDFReport(reportData)
}

export function generateFinancialReport(data: any) {
  const reportData: ReportData = {
    title: "Reporte Financiero",
    subtitle: `Análisis financiero - ${data.period}`,
    data: data.transactions || [],
    columns: [
      { header: "Fecha", dataKey: "date", width: 25 },
      { header: "Concepto", dataKey: "concept", width: 40 },
      { header: "Profesional", dataKey: "professional", width: 35 },
      { header: "Empresa", dataKey: "company", width: 35 },
      { header: "Monto", dataKey: "amount", width: 25 },
      { header: "Estado", dataKey: "status", width: 20 },
    ],
    summary: [
      { label: "Ingresos totales", value: `$${data.totalIncome?.toLocaleString() || 0}` },
      { label: "Gastos totales", value: `$${data.totalExpenses?.toLocaleString() || 0}` },
      { label: "Utilidad neta", value: `$${data.netProfit?.toLocaleString() || 0}` },
      { label: "Transacciones", value: data.transactions?.length || 0 },
    ],
    filters: [{ label: "Período", value: data.period }],
  }

  return generatePDFReport(reportData)
}

// Función para generar reporte de métricas
export function generateMetricsReport(metrics: any) {
  const reportData: ReportData = {
    title: "Reporte de Métricas del Sistema",
    subtitle: "Indicadores clave de rendimiento (KPIs)",
    data: [
      { metric: "Citas programadas", value: metrics.totalAppointments, trend: "+12%" },
      { metric: "Tasa de confirmación", value: `${metrics.confirmationRate}%`, trend: "+5%" },
      { metric: "Profesionales activos", value: metrics.activeProfessionals, trend: "+2%" },
      { metric: "Satisfacción promedio", value: `${metrics.averageRating}/5.0`, trend: "+0.3" },
      { metric: "Tiempo promedio consulta", value: `${metrics.averageConsultationTime} min`, trend: "-5 min" },
    ],
    columns: [
      { header: "Métrica", dataKey: "metric", width: 60 },
      { header: "Valor", dataKey: "value", width: 30 },
      { header: "Tendencia", dataKey: "trend", width: 25 },
    ],
    summary: [
      { label: "Eficiencia general", value: `${metrics.overallEfficiency}%` },
      { label: "Crecimiento mensual", value: `${metrics.monthlyGrowth}%` },
      { label: "Retención pacientes", value: `${metrics.patientRetention}%` },
      { label: "Utilización recursos", value: `${metrics.resourceUtilization}%` },
    ],
  }

  return generatePDFReport(reportData)
}
