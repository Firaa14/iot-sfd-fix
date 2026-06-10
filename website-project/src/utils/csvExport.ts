import { FirebaseEvent } from '../types'

/**
 * Export events to CSV — exports whatever events are passed in (already filtered).
 * CSV format: Timestamp, Event Type, Source, Description, Status
 * Timestamp uses ISO-like format: YYYY-MM-DD HH:MM:SS (Excel-friendly)
 */
export const exportEventsToCSV = (events: FirebaseEvent[], filename: string = 'events.csv') => {
  if (events.length === 0) {
    alert('Tidak ada data untuk diekspor!')
    return
  }

  // Format timestamp as YYYY-MM-DD HH:MM:SS (Excel-friendly)
  const formatTimestamp = (ts: number): string => {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  // Define headers — matches the requested CSV columns
  const headers = ['Timestamp', 'Event Type', 'Source', 'Description', 'Status']

  // Convert events to CSV rows
  const rows = events.map((event) => [
    formatTimestamp(event.timestamp),
    event.type,
    event.source || 'System',
    event.details || '',
    event.status,
  ])

  // Combine headers and rows — escape double quotes inside cells
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const filterEventsByDateRange = (events: FirebaseEvent[], startDate: Date, endDate: Date) => {
  const start = startDate.getTime()
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1).getTime() // Include full end date

  return events.filter((event) => event.timestamp >= start && event.timestamp < end)
}
