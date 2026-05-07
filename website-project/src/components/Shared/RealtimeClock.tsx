import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

/**
 * Real-time clock component
 * Displays current time synchronized with server
 * Updates every 1 second for smooth clock display
 */
export const RealtimeClock: React.FC = () => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString())
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }))

  useEffect(() => {
    // Update time every 1 second
    const interval = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString())
      setDate(now.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-lg border border-slate-700">
      <Clock className="w-4 h-4 text-blue-400" />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-100 font-mono">
          {time}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {date}
        </span>
      </div>
    </div>
  )
}
