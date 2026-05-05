import { FirebaseEvent } from '../types'

export const exportEventsToCSV = (events: FirebaseEvent[], filename: string = 'events.csv') => {
  if (events.length === 0) {
    alert('Tidak ada data untuk diekspor!')
    return
  }

  // Define headers
  const headers = ['Timestamp', 'Event Type', 'Status', 'Details', 'Source']

  // Convert events to CSV rows
  const rows = events.map((event) => [
    new Date(event.timestamp).toLocaleString('id-ID'),
    event.type,
    event.status,
    event.details,
    event.source,
  ])

  // Combine headers and rows
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
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
