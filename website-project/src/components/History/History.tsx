import React, { useMemo, useState } from 'react'
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
import { Thermometer, Droplets, Activity, Flame } from 'lucide-react'

interface HistoryProps {
  historicalData: any[]
  fireIncidentsCount: number
  onDateRangeChange?: (dateRange: { start: Date; end: Date } | undefined) => void
}

export const History: React.FC<HistoryProps> = ({
  historicalData,
  fireIncidentsCount,
  onDateRangeChange
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h')

  // Log when historical data is updated (for debugging real-time updates)
  React.useEffect(() => {
    console.log('[History] 📊 Historical data updated from Firebase (SAME PATH AS OVERVIEW: sensors/current):', historicalData.length, 'records')
    if (historicalData.length > 0) {
      console.log('[History] 🆕 Latest reading (from sensors/current):', {
        temperature: historicalData[0]?.temperature,
        humidity: historicalData[0]?.humidity,
        flameSensor: historicalData[0]?.flameSensor,
        timestamp: historicalData[0]?.timestamp,
        localTime: historicalData[0]?.localTime,
      })
    } else {
      console.log('[History] ℹ️ No historical data available from sensors/current')
    }
  }, [historicalData])

  // Handle period selection and date range filtering
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)

    if (onDateRangeChange) {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }

      onDateRangeChange({ start: startDate, end: now })
    }
  }
  // Process historical data for display
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return []
    }

    // Take latest 24 records for chart display
    return historicalData.slice(0, 24).map((record) => {
      const timestamp = typeof record.timestamp === 'string' 
        ? new Date(record.timestamp).getTime() 
        : record.timestamp
      return {
        time: new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        temp: record.temperature || 0,
        humidity: record.humidity || 0,
        waterLevel: record.waterLevel || 0,
        timestamp: timestamp,
      }
    }).reverse() // Reverse to show oldest first for time-series
  }, [historicalData])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return {
        avgTemp: 0,
        avgHumidity: 0,
        totalRecords: 0,
        fireIncidents: fireIncidentsCount,
      }
    }

    const temps = historicalData.map((d) => d.temperature || 0)
    const humidities = historicalData.map((d) => d.humidity || 0)

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length

    return {
      avgTemp: parseFloat(avgTemp.toFixed(1)),
      avgHumidity: parseFloat(avgHumidity.toFixed(1)),
      totalRecords: historicalData.length,
      fireIncidents: fireIncidentsCount,
    }
  }, [historicalData, fireIncidentsCount])

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-slate-400">Analyze sensor trends and system performance</p>
      </div>

      {/* Historical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Avg Temperature"
          value={stats.avgTemp}
          unit="°C"
          icon={<Thermometer size={24} />}
          trend={0}
        />
        <StatCard
          title="Avg Humidity"
          value={stats.avgHumidity}
          unit="%"
          icon={<Droplets size={24} />}
          trend={0}
        />
        <StatCard
          title="Total Records"
          value={stats.totalRecords}
          unit="readings"
          icon={<Activity size={24} />}
          trend={0}
        />
        <StatCard
          title="Fire Incidents"
          value={stats.fireIncidents}
          unit="events"
          icon={<Flame size={24} />}
          trend={0}
        />
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {['24h', '7d', '30d', '90d'].map((period) => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === period
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
          <p className="text-slate-400 text-sm">Temperature, Humidity, and Water Level trends (Real-time from Firebase)</p>
        </div>

        {chartData.length === 0 ? (
          <div className="w-full h-96 flex items-center justify-center">
            <p className="text-slate-400">No historical data available yet. Wait for sensor readings to appear...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
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
        )}
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
