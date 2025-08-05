"use client"

import type React from "react"

import { useMemo, useState, useCallback } from "react"
import { FixedSizeList as List } from "react-window"

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

export default function VirtualList<T>({ items, height, itemHeight, renderItem, className = "" }: VirtualListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items

    return items.filter((item: any) => {
      const searchableText = Object.values(item)
        .filter((value) => typeof value === "string")
        .join(" ")
        .toLowerCase()

      return searchableText.includes(searchTerm.toLowerCase())
    })
  }, [items, searchTerm])

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>{renderItem(filteredItems[index], index)}</div>
    ),
    [filteredItems, renderItem],
  )

  return (
    <div className={className}>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <List height={height} itemCount={filteredItems.length} itemSize={itemHeight} width="100%">
        {Row}
      </List>
    </div>
  )
}
