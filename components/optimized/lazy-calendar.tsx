"use client"

import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load the heavy calendar component
const ProfessionalCalendar = lazy(() => import("@/components/professional-calendar"))

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

interface LazyCalendarProps {
  professionalId: string
  companyId: number
}

export default function LazyCalendar({ professionalId, companyId }: LazyCalendarProps) {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <ProfessionalCalendar professionalId={professionalId} companyId={companyId} />
    </Suspense>
  )
}
