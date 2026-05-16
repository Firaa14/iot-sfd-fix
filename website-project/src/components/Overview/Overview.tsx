import React from 'react'
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
import { StatCard, HealthCard } from '../Shared/Cards'

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
  device,
  recentEvents,
  isFireDetected = false,
  settings,
}) => {
  // Force re-render when settings change
  React.useEffect(() => {
    // This effect ensures the component re-renders when settings change
  }, [settings])

  // Log current sensor data for debugging
  React.useEffect(() => {
    if (current) {
      console.log('[Overview] 📊 Current sensor data from Firebase (PATH: sensors/current):', {
        temperature: current.temperature,
        humidity: current.humidity,
        flameSensor: current.flameSensor,
        pumpState: current.pumpState,
        timestamp: current.timestamp,
        localTime: new Date(current.timestamp).toLocaleString(),
      })
    } else {
      console.log('[Overview] ℹ️ No current sensor data available from sensors/current')
    }
  }, [current])

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

  // Mock data untuk chart
  const chartData = [
    { time: '16:50', temp: 29.0, humidity: 69.2 },
    { time: '16:51', temp: 29.1, humidity: 69.3 },
    { time: '16:52', temp: 29.2, humidity: 69.4 },
    { time: '16:53', temp: 29.1, humidity: 69.5 },
    { time: '16:54', temp: 28.9, humidity: 69.4 },
    { time: '16:55', temp: 29.0, humidity: 69.3 },
    { time: '16:56', temp: 29.1, humidity: 69.2 },
    { time: '16:57', temp: 29.2, humidity: 69.1 },
    { time: '16:58', temp: 29.1, humidity: 69.0 },
  ]

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

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">System Health</h2>
          <div className="space-y-6">
            <HealthCard
              icon={<Activity size={20} />}
              label="Status"
              value={device?.online ? 'Device Online' : 'Offline'}
              status={device?.online ? 'online' : 'offline'}
            />
            <HealthCard
              icon={<Activity size={20} />}
              label="Uptime"
              value="12d 4h 32m"
              status="good"
            />
            <HealthCard
              icon={<Activity size={20} />}
              label="Signal Strength"
              value="-65 dBm (Good)"
              status="good"
            />
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-2">FIRMWARE VERSION</p>
              <p className="font-semibold text-white">{device?.firmwareVersion || 'v2.4.1-stable'}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.slice(0, 5).map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-700/50 last:border-0">
                  <div className="mt-1">
                    {event.type === 'FIRE_DETECTED' && <Flame size={16} className="text-red-400" />}
                    {event.type === 'WATER_LEVEL_LOW' && <Droplets size={16} className="text-yellow-400" />}
                    {event.type === 'PUMP_ACTIVATED' && <Activity size={16} className="text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{event.type}</p>
                    <p className="text-slate-400 text-xs">{event.details}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No recent events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview