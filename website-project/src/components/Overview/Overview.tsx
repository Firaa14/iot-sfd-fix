import React, { useState, useRef, useEffect } from 'react'
import { Flame, Droplets, Activity, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { SensorReading, SystemSettings } from '../../types'
import { StatCard } from '../Shared/Cards'

interface OverviewProps {
  current: SensorReading | null
  device: any
  health: any
  recentEvents: any[]
  isFireDetected?: boolean
  settings?: SystemSettings | null
}

export const Overview: React.FC<OverviewProps> = ({
  current,
  isFireDetected = false,
  settings,
}) => {
  // Accumulate real sensor data for the chart (max 20 data points)
  const MAX_CHART_POINTS = 20
  const [chartData, setChartData] = useState<{ time: string; temp: number; humidity: number }[]>([])
  const lastTimestampRef = useRef<number>(0)

  useEffect(() => {
    if (current && current.timestamp !== lastTimestampRef.current) {
      lastTimestampRef.current = current.timestamp
      const timeLabel = new Date(current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setChartData(prev => {
        const next = [...prev, { time: timeLabel, temp: current.temperature, humidity: current.humidity }]
        return next.length > MAX_CHART_POINTS ? next.slice(next.length - MAX_CHART_POINTS) : next
      })
    }
  }, [current])

  // Force re-render when settings change
  useEffect(() => {
    // This effect ensures the component re-renders when settings change
  }, [settings])

  if (!current) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin text-red-500 mb-4 text-4xl">🔥</div>
          <p className="text-slate-300 text-lg font-semibold">Loading sensor data...</p>
          <p className="text-slate-500 text-sm mt-2">Connecting to Firebase</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('p-6 space-y-6', isFireDetected && 'bg-gradient-to-br from-red-950/30 to-slate-950')}>
      {/* Fire Alert Banner */}
      {isFireDetected && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-400 rounded-lg p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertTriangle size={32} className="text-white animate-bounce" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">🚨 FIRE DETECTED - ALERT STATUS 🚨</h2>
              <p className="text-red-100">Automatic sprinkler system is responding. Stay away from dangerous area!</p>
            </div>
            <Flame size={32} className="text-yellow-200 animate-bounce hidden sm:block" />
          </div>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-slate-400">Real-time fire detection system status</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Status"
          value={isFireDetected ? '🔥 ALERT' : 'SAFE'}
          icon={<Activity size={24} />}
          status={isFireDetected ? 'danger' : 'normal'}
        />
        <StatCard
          title="Temperature"
          value={current.temperature.toFixed(1)}
          unit="°C"
          icon={<Activity size={24} />}
          status={current.temperature > 35 ? 'danger' : current.temperature > 30 ? 'warning' : 'normal'}
        />
        <StatCard
          title="Pump State"
          value={current.pumpState}
          icon={<Droplets size={24} />}
          status={current.pumpState === 'ON' ? 'warning' : 'normal'}
        />
        <StatCard
          title="Water Level"
          value={current.waterLevel.toFixed(1)}
          unit="cm"
          icon={<Droplets size={24} />}
          status={
            !settings ? 'normal' :
            // Perbaikan: Tambahkan .normal.max pada perbandingan threshold
            current.waterLevel >= 2 && current.waterLevel <= settings.automation.waterLevelThreshold.normal.max ? 'normal' :
            current.waterLevel > settings.automation.waterLevelThreshold.normal.max && current.waterLevel <= settings.automation.waterLevelThreshold.normal.max + 2 ? 'warning' :
            current.waterLevel > settings.automation.waterLevelThreshold.normal.max + 2 ? 'danger' : 'normal'
          }
        />
      </div>

      {/* Temperature & Humidity Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Temperature & Humidity</h2>
          <p className="text-slate-400 text-sm">Last 10 minutes</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '0.875rem' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Temperature (°C)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Humidity (%)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


    </div>
  )
}

export default Overview