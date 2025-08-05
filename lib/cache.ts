import { unstable_cache } from "next/cache"

// Cache configuration
export const CACHE_TAGS = {
  APPOINTMENTS: "appointments",
  PROFESSIONALS: "professionals",
  COMPANIES: "companies",
  REPORTS: "reports",
} as const

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

// Generic cache wrapper
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyPrefix: string,
  tags: string[],
  revalidate: number = CACHE_DURATIONS.MEDIUM,
) {
  return unstable_cache(fn, [keyPrefix], {
    tags,
    revalidate,
  })
}

// Memory cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = CACHE_DURATIONS.SHORT * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const memoryCache = new MemoryCache()

// Auto cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(
    () => {
      memoryCache.cleanup()
    },
    5 * 60 * 1000,
  )
}
