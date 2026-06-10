import React, { useState } from 'react'
import {
  Flame,
  AlertCircle,
  Zap,
  Clock,
  Search,
  Download,
  Shield,
  Activity,
  Thermometer,
  Droplets,
  Server,
} from 'lucide-react'
import clsx from 'clsx'
import { FirebaseEvent } from '../../types'
import { exportEventsToCSV } from '../../utils/csvExport'

interface EventLogProps {
  events: FirebaseEvent[]
}

const formatEventTimestamp = (timestamp: number): string => {
  const d = new Date(timestamp)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  // ✅ Default filter langsung ke kategori pertama, tidak ada 'ALL'
  const [filter, setFilter] = useState('FIRE_DETECTED')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // ✅ Tidak ada 'ALL'
  const eventTypes = [
    'FIRE_DETECTED',
    'FIRE_CLEARED',
    'WATER_LEVEL_LOW',
    'PUMP_ACTIVATED',
    'PUMP_DEACTIVATED',
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'FIRE_DETECTED':
      case 'FIRE_CLEARED':
      case 'FIRE_ALERT_TRIGGERED':
      case 'FLAME_SENSOR_DETECTED':
      case 'FLAME_SENSOR_NORMAL':
        return <Flame size={16} className="text-red-400" />
      case 'WATER_LEVEL_LOW':
      case 'WATER_LEVEL_NORMAL':
      case 'WATER_LEVEL_CHANGED':
        return <Droplets size={16} className="text-blue-400" />
      case 'PUMP_ACTIVATED':
      case 'PUMP_DEACTIVATED':
      case 'MANUAL_PUMP_TRIGGER':
        return <Zap size={16} className="text-blue-400" />
      case 'ALARM_ACTIVATED':
      case 'ALARM_DEACTIVATED':
      case 'SERVO_OPEN':
      case 'SERVO_CLOSED':
        return <AlertCircle size={16} className="text-orange-400" />
      case 'TEMPERATURE_CHANGED':
        return <Thermometer size={16} className="text-yellow-400" />
      case 'HUMIDITY_CHANGED':
        return <Activity size={16} className="text-cyan-400" />
      case 'USER_LOGIN':
      case 'USER_LOGOUT':
      case 'SESSION_EXPIRED':
      case 'FAILED_LOGIN':
        return <Shield size={16} className="text-purple-400" />
      case 'DEVICE_CONNECTED':
      case 'DEVICE_DISCONNECTED':
      case 'SYSTEM_STARTED':
      case 'DATABASE_CONNECTED':
      case 'DATABASE_ERROR':
      case 'RESTART_REQUEST':
        return <Server size={16} className="text-slate-400" />
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

  const sortedEvents = React.useMemo(() => {
    return [...events].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }, [events])

  const filteredEvents = React.useMemo(() => {
    return sortedEvents.filter((event) => {
      // ✅ Tidak ada kondisi 'ALL' — filter selalu eksak
      const matchesFilter = event.type === filter

      const tsStr = formatEventTimestamp(event.timestamp)
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        event.type.toLowerCase().includes(search) ||
        (event.details || '').toLowerCase().includes(search) ||
        (event.source || '').toLowerCase().includes(search) ||
        tsStr.toLowerCase().includes(search)

      return matchesFilter && matchesSearch
    })
  }, [sortedEvents, filter, searchTerm])

  const totalEvents = filteredEvents.length
  const totalPages = Math.ceil(totalEvents / rowsPerPage) || 1
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      alert('Tidak ada data untuk diekspor!')
      return
    }
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const filename = `events_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.csv`
    exportEventsToCSV(filteredEvents, filename)
  }

  const getEventDescription = (event: FirebaseEvent): string => {
    if (event.details && event.details.trim()) {
      return event.details
    }
    const descriptions: { [key: string]: string } = {
      FIRE_DETECTED: 'Fire detected — pump activated automatically',
      FIRE_CLEARED: 'Fire condition cleared, system returned to normal',
      FLAME_SENSOR_DETECTED: 'Flame sensor detected fire presence',
      FLAME_SENSOR_NORMAL: 'Flame sensor returned to normal state',
      WATER_LEVEL_LOW: 'Water level below threshold',
      WATER_LEVEL_NORMAL: 'Water level returned to normal range',
      PUMP_ACTIVATED: 'Water pump activated',
      PUMP_DEACTIVATED: 'Water pump deactivated',
      MANUAL_PUMP_TRIGGER: 'Manual pump trigger from dashboard',
      TEMPERATURE_CHANGED: 'Temperature reading changed',
      HUMIDITY_CHANGED: 'Humidity reading changed',
      SERVO_OPEN: 'Servo valve opened',
      SERVO_CLOSED: 'Servo valve closed',
      ALARM_ACTIVATED: 'Alarm system activated',
      ALARM_DEACTIVATED: 'Alarm system deactivated',
      USER_LOGIN: 'User logged in to the system',
      USER_LOGOUT: 'User logged out from the system',
      SESSION_EXPIRED: 'User session expired — automatic logout',
      FAILED_LOGIN: 'Failed login attempt',
      DEVICE_CONNECTED: 'IoT device connected to system',
      DEVICE_DISCONNECTED: 'IoT device disconnected from system',
      SYSTEM_STARTED: 'System started successfully',
      RESTART_REQUEST: 'Device restart requested from dashboard',
      DATABASE_CONNECTED: 'Database connection established',
      DATABASE_ERROR: 'Database connection error occurred',
    }
    return descriptions[event.type] || 'System event occurred'
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Event Log</h1>
        <p className="text-slate-400">Detailed record of all system activities</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
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

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 border border-green-500 rounded-lg text-white hover:bg-green-700 transition-colors font-medium"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* ✅ Filter Tabs — 5 kategori, tanpa ALL */}
      <div className="flex gap-2 flex-wrap">
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={clsx(
              'px-4 py-2 rounded-lg transition-colors text-sm',
              filter === type
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            )}
          >
            {type}
          </button>
        ))}
      </div>

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
                  <tr
                    key={`${event.id}-${idx}`}
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap font-mono text-xs">
                      {formatEventTimestamp(event.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <span className="text-white font-medium">{event.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          'px-3 py-1 rounded-full text-xs font-medium border',
                          getStatusColor(event.status)
                        )}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {getEventDescription(event)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{event.source}</td>
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

        {totalEvents > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-700 bg-slate-900/50">
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

            <div className="text-sm text-slate-400">
              {startIndex + 1}–{Math.min(endIndex, totalEvents)} of {totalEvents} events
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

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

      <div className="text-sm text-slate-400">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  )
}

export default EventLog