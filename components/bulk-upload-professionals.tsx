"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BulkUploadProfessionalsProps {
  companyId?: number
  onUploadComplete?: (results: any[]) => void
}

export default function BulkUploadProfessionals({ companyId, onUploadComplete }: BulkUploadProfessionalsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [uploadComplete, setUploadComplete] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ]

      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile)
        setResults([])
        setUploadComplete(false)
      } else {
        toast({
          title: "Archivo inválido",
          description: "Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV",
          variant: "destructive",
        })
      }
    }
  }

  const processFile = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate file processing
      const professionals = await parseFile(file)

      if (professionals.length === 0) {
        toast({
          title: "Archivo vacío",
          description: "El archivo no contiene datos válidos",
          variant: "destructive",
        })
        setUploading(false)
        return
      }

      // Upload in batches
      const batchSize = 10
      const batches = []
      for (let i = 0; i < professionals.length; i += batchSize) {
        batches.push(professionals.slice(i, i + batchSize))
      }

      const allResults: any[] = []

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]

        try {
          const response = await fetch("/api/professionals/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              professionals: batch,
              companyId,
            }),
          })

          const data = await response.json()

          if (response.ok) {
            allResults.push(...data.results)
          } else {
            // Add error results for failed batch
            batch.forEach((prof) => {
              allResults.push({
                email: prof.email,
                success: false,
                error: data.error || "Error en el servidor",
              })
            })
          }
        } catch (error) {
          // Add error results for network failure
          batch.forEach((prof) => {
            allResults.push({
              email: prof.email,
              success: false,
              error: "Error de conexión",
            })
          })
        }

        // Update progress
        const progressPercent = ((i + 1) / batches.length) * 100
        setProgress(progressPercent)
      }

      setResults(allResults)
      setUploadComplete(true)

      const successCount = allResults.filter((r) => r.success).length
      const errorCount = allResults.filter((r) => !r.success).length

      toast({
        title: "Carga completada",
        description: `${successCount} profesionales creados exitosamente. ${errorCount} errores.`,
        variant: successCount > 0 ? "default" : "destructive",
      })

      if (onUploadComplete) {
        onUploadComplete(allResults)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: "Error procesando el archivo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n")
          const professionals: any[] = []

          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))

            if (columns.length >= 4) {
              professionals.push({
                name: columns[0],
                specialty: columns[1],
                email: columns[2],
                phone: columns[3],
                weeklyHours: columns[4] ? Number.parseInt(columns[4]) : 40,
              })
            }
          }

          resolve(professionals)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Error reading file"))
      reader.readAsText(file)
    })
  }

  const downloadTemplate = () => {
    const csvContent = `Nombre,Especialidad,Email,Teléfono,Horas Semanales
Dr. Juan Pérez,Cardiología,juan.perez@hospital.com,+57 300 123 4567,40
Dra. María García,Pediatría,maria.garcia@hospital.com,+57 300 234 5678,35
Dr. Carlos López,Neurología,carlos.lopez@hospital.com,+57 300 345 6789,38`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plantilla-profesionales.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetUpload = () => {
    setFile(null)
    setResults([])
    setUploadComplete(false)
    setProgress(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
          <Upload className="w-4 h-4 mr-2" />
          Carga Masiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Profesionales</DialogTitle>
          <DialogDescription>Sube un archivo CSV o Excel con la información de los profesionales</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadComplete && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="file">Archivo CSV/Excel</Label>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Descargar Plantilla
                  </Button>
                </div>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {file && (
                  <div className="text-sm text-gray-600">
                    Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato requerido:</strong> Nombre, Especialidad, Email, Teléfono, Horas Semanales
                  <br />
                  <strong>Ejemplo:</strong> Dr. Juan Pérez, Cardiología, juan@hospital.com, +57 300 123 4567, 40
                </AlertDescription>
              </Alert>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Procesando profesionales...</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>
                  Cancelar
                </Button>
                <Button onClick={processFile} disabled={!file || uploading}>
                  {uploading ? "Procesando..." : "Procesar Archivo"}
                </Button>
              </div>
            </>
          )}

          {uploadComplete && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Carga Completada</h3>
                <p className="text-gray-600">
                  {results.filter((r) => r.success).length} profesionales creados exitosamente
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      result.success ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">{result.email}</span>
                    </div>
                    {!result.success && <span className="text-xs text-red-600">{result.error}</span>}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetUpload}>
                  Cargar Más
                </Button>
                <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
