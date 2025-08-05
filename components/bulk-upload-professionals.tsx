"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, AlertCircle, Users, Loader2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import Papa from "papaparse"

interface ProfessionalData {
  name: string
  specialty: string
  email: string
  phone: string
  companyId: number
  status?: string
  weeklyHours?: number
  [key: string]: any
}

interface UploadResult {
  success: boolean
  data?: ProfessionalData
  error?: string
  row: number
}

interface BulkUploadProps {
  companyId?: number
  onUploadComplete: (results: any[]) => void
}

export default function BulkUploadProfessionals({ companyId, onUploadComplete }: BulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadedData, setUploadedData] = useState<ProfessionalData[]>([])
  const [validationResults, setValidationResults] = useState<UploadResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<"upload" | "validate" | "process" | "complete">("upload")

  // Template data for download
  const templateData = [
    {
      name: "Dr. Juan Pérez",
      specialty: "Cardiología",
      email: "juan.perez@hospital.com",
      phone: "+57 300 123 4567",
      weeklyHours: 40,
      status: "active",
    },
    {
      name: "Dra. María González",
      specialty: "Pediatría",
      email: "maria.gonzalez@hospital.com",
      phone: "+57 300 234 5678",
      weeklyHours: 35,
      status: "active",
    },
    {
      name: "Dr. Carlos Rodríguez",
      specialty: "Neurología",
      email: "carlos.rodriguez@hospital.com",
      phone: "+57 300 345 6789",
      weeklyHours: 45,
      status: "active",
    },
  ]

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          let parsedData: ProfessionalData[] = []

          if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            // Parse Excel file
            const workbook = XLSX.read(data, { type: "binary" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            parsedData = XLSX.utils.sheet_to_json(worksheet)
          } else if (file.name.endsWith(".csv")) {
            // Parse CSV file
            Papa.parse(data as string, {
              header: true,
              complete: (results) => {
                parsedData = results.data as ProfessionalData[]
              },
            })
          }

          // Add companyId to each record
          const dataWithCompany = parsedData.map((item) => ({
            ...item,
            companyId: companyId || 1,
          }))

          setUploadedData(dataWithCompany)
          setCurrentStep("validate")
          validateData(dataWithCompany)
        } catch (error) {
          console.error("Error parsing file:", error)
        }
      }

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file)
      } else {
        reader.readAsBinaryString(file)
      }
    },
    [companyId],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const validateData = (data: ProfessionalData[]) => {
    const results: UploadResult[] = data.map((item, index) => {
      const errors: string[] = []

      // Required field validation
      if (!item.name || item.name.toString().trim() === "") {
        errors.push("Nombre es requerido")
      }
      if (!item.specialty || item.specialty.toString().trim() === "") {
        errors.push("Especialidad es requerida")
      }
      if (!item.email || item.email.toString().trim() === "") {
        errors.push("Email es requerido")
      } else if (!/\S+@\S+\.\S+/.test(item.email.toString())) {
        errors.push("Email inválido")
      }
      if (!item.phone || item.phone.toString().trim() === "") {
        errors.push("Teléfono es requerido")
      }

      // Set defaults
      if (!item.status) item.status = "active"
      if (!item.weeklyHours) item.weeklyHours = 40

      return {
        success: errors.length === 0,
        data: item,
        error: errors.join(", "),
        row: index + 1,
      }
    })

    setValidationResults(results)
  }

  const processUpload = async () => {
    setIsProcessing(true)
    setCurrentStep("process")
    setUploadProgress(0)

    const validRecords = validationResults.filter((result) => result.success)
    const results: UploadResult[] = []

    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i]
      try {
        const response = await fetch("/api/professionals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(record.data),
        })

        const result = await response.json()

        results.push({
          success: result.success,
          data: record.data,
          error: result.success ? undefined : result.error,
          row: record.row,
        })

        setUploadProgress(((i + 1) / validRecords.length) * 100)

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        results.push({
          success: false,
          data: record.data,
          error: "Error de conexión",
          row: record.row,
        })
      }
    }

    setValidationResults(results)
    setCurrentStep("complete")
    setIsProcessing(false)

    if (onUploadComplete) {
      onUploadComplete(results)
    }
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Profesionales")
    XLSX.writeFile(wb, "plantilla_profesionales.xlsx")
  }

  const resetUpload = () => {
    setUploadedData([])
    setValidationResults([])
    setCurrentStep("upload")
    setUploadProgress(0)
    setIsProcessing(false)
  }

  const validCount = validationResults.filter((r) => r.success).length
  const errorCount = validationResults.filter((r) => !r.success).length
  const successCount = validationResults.filter((r) => r.success && currentStep === "complete").length

  const handleUpload = () => {
    // Simulate successful upload
    const mockResults = [
      { success: true, name: "Dr. Juan Pérez", email: "juan@example.com" },
      { success: true, name: "Dra. María García", email: "maria@example.com" },
    ]

    onUploadComplete(mockResults)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Carga Masiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Carga Masiva de Profesionales</span>
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel o CSV con la información de los profesionales para crearlos automáticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { key: "upload", label: "Subir Archivo", icon: Upload },
              { key: "validate", label: "Validar Datos", icon: CheckCircle },
              { key: "process", label: "Procesar", icon: Loader2 },
              { key: "complete", label: "Completado", icon: CheckCircle },
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.key
              const isCompleted = ["upload", "validate", "process", "complete"].indexOf(currentStep) > index

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`ml-2 text-sm ${isActive ? "font-semibold" : ""}`}>{step.label}</span>
                  {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
                </div>
              )
            })}
          </div>

          <Tabs value={currentStep} className="w-full">
            <TabsContent value="upload" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Area */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subir Archivo</CardTitle>
                    <CardDescription>Arrastra y suelta tu archivo o haz clic para seleccionar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      {isDragActive ? (
                        <p className="text-blue-600">Suelta el archivo aquí...</p>
                      ) : (
                        <div>
                          <p className="text-gray-600 mb-2">Arrastra un archivo Excel o CSV aquí</p>
                          <p className="text-sm text-gray-500">Formatos soportados: .xlsx, .xls, .csv</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Template Download */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plantilla</CardTitle>
                    <CardDescription>Descarga la plantilla para estructurar tus datos correctamente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Campos requeridos:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          • <strong>name:</strong> Nombre completo del profesional
                        </li>
                        <li>
                          • <strong>specialty:</strong> Especialidad médica
                        </li>
                        <li>
                          • <strong>email:</strong> Email corporativo
                        </li>
                        <li>
                          • <strong>phone:</strong> Número de teléfono
                        </li>
                        <li>
                          • <strong>weeklyHours:</strong> Horas semanales (opcional)
                        </li>
                        <li>
                          • <strong>status:</strong> Estado (active/inactive)
                        </li>
                      </ul>
                    </div>
                    <Button onClick={downloadTemplate} variant="outline" className="w-full bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Plantilla Excel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="validate" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Validación de Datos</h3>
                  <p className="text-sm text-gray-600">Se encontraron {uploadedData.length} registros en el archivo</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {validCount} Válidos
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {errorCount} Con errores
                    </Badge>
                  )}
                </div>
              </div>

              {errorCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se encontraron {errorCount} registros con errores. Solo se procesarán los registros válidos.
                  </AlertDescription>
                </Alert>
              )}

              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fila</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.row}</TableCell>
                        <TableCell>
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>{result.data?.name}</TableCell>
                        <TableCell>{result.data?.specialty}</TableCell>
                        <TableCell>{result.data?.email}</TableCell>
                        <TableCell className="text-red-600 text-sm">{result.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetUpload}>
                  Cancelar
                </Button>
                <Button onClick={processUpload} disabled={validCount === 0} className="bg-green-600 hover:bg-green-700">
                  Procesar {validCount} Profesionales
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="process" className="space-y-4">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Procesando Profesionales</h3>
                  <p className="text-sm text-gray-600">Creando cuentas y enviando credenciales por email...</p>
                </div>
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-600">{Math.round(uploadProgress)}% completado</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="complete" className="space-y-4">
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-green-600">¡Carga Completada!</h3>
                  <p className="text-gray-600">Se procesaron {successCount} profesionales exitosamente</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-green-700">Creados</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {validationResults.filter((r) => !r.success).length}
                  </div>
                  <div className="text-sm text-red-700">Errores</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{uploadedData.length}</div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Se han enviado las credenciales de acceso por email a cada profesional creado. Los profesionales
                  pueden iniciar sesión con su email corporativo.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button onClick={() => setIsOpen(false)} className="bg-green-600 hover:bg-green-700">
                  Finalizar
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
