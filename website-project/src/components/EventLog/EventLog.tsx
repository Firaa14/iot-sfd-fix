import React, { useState } from 'react'
import { Flame, AlertCircle, Zap, Clock, Search, Download } from 'lucide-react'
import clsx from 'clsx'
import { FirebaseEvent } from '../../types'
import { DateRangePicker } from '../DateRangePicker/DateRangePicker'
import { exportEventsToCSV, filterEventsByDateRange } from '../../utils/csvExport'

interface EventLogProps {
  events: FirebaseEvent[]
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDateRangePicker, setShowDateRangePicker] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // Filter events to only show year 2026 (permanent history)
  const events2026 = React.useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.timestamp)
      return eventDate.getFullYear() === 2026
    })
  }, [events])

  // Log when events are updated (for debugging real-time updates)
  React.useEffect(() => {
    console.log('[EventLog] 📊 Events from history (PERMANENT):', events.length, 'total, 2026 filtered:', events2026.length)
    if (events2026.length > 0) {
      console.log('[EventLog] 🆕 Latest 2026 event:', {
        type: events2026[0]?.type,
        timestamp: events2026[0]?.timestamp,
        localTime: new Date(events2026[0]?.timestamp).toLocaleString(),
        message: events2026[0]?.details
      })
    } else {
      console.log('[EventLog] ℹ️ No 2026 events available')
    }
  }, [events, events2026])

  const eventTypes = ['All', 'FIRE_DETECTED', 'WATER_LEVEL_LOW', 'PUMP_ACTIVATED', 'PUMP_DEACTIVATED']

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FIRE_DETECTED':
        return <Flame size={16} className="text-red-400" />
      case 'WATER_LEVEL_LOW':
        return <AlertCircle size={16} className="text-yellow-400" />
      case 'PUMP_ACTIVATED':
      case 'PUMP_DEACTIVATED':
        return <Zap size={16} className="text-blue-400" />
      default:
        return <Clock size={16} className="text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'ALERT':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const filteredEvents = events2026
    // Sort by timestamp descending (newest first)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .filter((event) => {
      const matchesFilter = filter === 'All' || event.type === filter
      const matchesSearch =
        event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })

  // Pagination logic
  const totalEvents = filteredEvents.length
  const totalPages = Math.ceil(totalEvents / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleExportCSV = (startDate: Date, endDate: Date) => {
    const dateFilteredEvents = filterEventsByDateRange(filteredEvents, startDate, endDate)
    const filename = `events_${startDate.toLocaleDateString('en-US')}_to_${endDate.toLocaleDateString('en-US')}.csv`
    exportEventsToCSV(dateFilteredEvents, filename)
  }

  // Get event description based on event type (with fallback from backend details)
  const getEventDescription = (event: FirebaseEvent): string => {
    // If event has details from backend, use it
    if (event.details && event.details.trim()) {
      return event.details
    }

    // Otherwise, generate description based on event type
    const descriptions: { [key: string]: string } = {
      'FIRE_DETECTED': 'Fire detected! Pump activated automatically',
      'FIRE_CLEARED': 'Fire condition cleared and system returned to normal',
      'WATER_LEVEL_LOW': 'Water level below threshold',
      'PUMP_ACTIVATED': 'Pump activated automatically',
      'PUMP_DEACTIVATED': 'Pump stopped after operation completed',
      'MANUAL_PUMP_TRIGGER': 'Manual pump trigger from dashboard',
      'RESTART_REQUEST': 'Device restart requested from web dashboard',
    }
    return descriptions[event.type] || 'System event occurred'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Date Range Picker Modal */}
      <DateRangePicker
        isOpen={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        onConfirm={handleExportCSV}
      />

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Event Log</h1>
        <p className="text-slate-400">Detailed record of all system activities</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search events or sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>

        {/* Export */}
        <button
          onClick={() => setShowDateRangePicker(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 border border-green-500 rounded-lg text-white hover:bg-green-700 transition-colors font-medium"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={clsx(
              'px-4 py-2 rounded-lg transition-colors',
              filter === type
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Event Type</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Details</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map((event, idx) => (
                  <tr key={`${event.id}-${idx}`} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <span className="text-white font-medium">{event.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(event.status))}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {getEventDescription(event)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {event.source}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalEvents > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-700 bg-slate-900/50">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-slate-600"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page info */}
            <div className="text-sm text-slate-400">
              {totalEvents > 0 ? (
                <>
                  {startIndex + 1}-{Math.min(endIndex, totalEvents)} of {totalEvents} events
                </>
              ) : (
                'No events'
              )}
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={clsx(
                        'px-3 py-1 border rounded transition-colors',
                        currentPage === pageNum
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-sm text-slate-400">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  )
}

export default EventLog
