import React from 'react'
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
import { StatCard } from '../Shared/Cards'
import { Thermometer, Droplets, Activity } from 'lucide-react'

interface HistoryProps {
  current: any
}

export const History: React.FC<HistoryProps> = ({ current }) => {
  // Mock historical data untuk 24 jam
  const historicalData = [
    { time: '00:00', temp: 26.5, humidity: 60.2, waterLevel: 50 },
    { time: '04:00', temp: 25.8, humidity: 62.1, waterLevel: 49.8 },
    { time: '08:00', temp: 27.2, humidity: 61.5, waterLevel: 49.5 },
    { time: '12:00', temp: 28.1, humidity: 63.2, waterLevel: 49.2 },
    { time: '16:00', temp: 29.5, humidity: 65.8, waterLevel: 48.9 },
    { time: '20:00', temp: 27.9, humidity: 64.2, waterLevel: 48.7 },
    { time: '23:59', temp: 27.4, humidity: 64.2, waterLevel: 48.7 },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-slate-400">Analyze sensor trends and system performance</p>
      </div>

      {/* Historical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Avg Temperature"
          value={27.4}
          unit="°C"
          icon={<Thermometer size={24} />}
          trend={2.4}
        />
        <StatCard
          title="Avg Humidity"
          value={64.2}
          unit="%"
          icon={<Droplets size={24} />}
          trend={-1.2}
        />
        <StatCard
          title="Total Pump Runtime"
          value="12m 45s"
          icon={<Activity size={24} />}
          trend={0}
        />
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {['24h', '7d', '30d', '90d'].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === '24h'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Sensor Time-Series Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Sensor Time-Series</h2>
          <p className="text-slate-400 text-sm">Temperature, Humidity, and Water Level trends</p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData}>
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
            <Line
              type="monotone"
              dataKey="waterLevel"
              stroke="#06b6d4"
              dot={false}
              strokeWidth={2}
              name="Water Level (cm)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">Max Temperature</p>
          <p className="text-2xl font-bold text-white">29.5°C</p>
          <p className="text-slate-500 text-xs mt-1">16:00 Today</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">Min Temperature</p>
          <p className="text-2xl font-bold text-white">25.8°C</p>
          <p className="text-slate-500 text-xs mt-1">04:00 Today</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">Fire Incidents</p>
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-slate-500 text-xs mt-1">Last 24 hours</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">System Uptime</p>
          <p className="text-2xl font-bold text-white">100%</p>
          <p className="text-slate-500 text-xs mt-1">No downtime</p>
        </div>
      </div>
    </div>
  )
}

export default History
