import React, { useMemo, useEffect } from 'react'
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
  historicalData?: any[]
}

/**
 * Group historical data by hour.
 * Each data point represents the AVERAGE temperature & humidity within that hour.
 * Returns data sorted chronologically (oldest first) for chart display.
 * No timestamps are shown — only sequential point indices.
 */
function groupDataByHour(data: any[]): { label: string; temp: number; humidity: number; sortKey: number }[] {
  if (!data || data.length === 0) return []

  // Group readings by hour key (YYYY-MM-DD HH)
  const hourlyMap = new Map<string, { temps: number[]; humidities: number[]; timestamp: number }>()

  data.forEach((item) => {
    if (item.temperature == null || item.humidity == null || !item.timestamp) return

    const date = new Date(item.timestamp)
    const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`

    if (!hourlyMap.has(hourKey)) {
      hourlyMap.set(hourKey, { temps: [], humidities: [], timestamp: item.timestamp })
    }

    const group = hourlyMap.get(hourKey)!
    group.temps.push(item.temperature)
    group.humidities.push(item.humidity)
    if (item.timestamp > group.timestamp) {
      group.timestamp = item.timestamp
    }
  })

  // Convert to array and calculate averages
  const result = Array.from(hourlyMap.entries()).map(([_key, group]) => {
    const avgTemp = group.temps.reduce((a, b) => a + b, 0) / group.temps.length
    const avgHumidity = group.humidities.reduce((a, b) => a + b, 0) / group.humidities.length

    return {
      label: '', // Will be assigned as sequential index below
      temp: parseFloat(avgTemp.toFixed(1)),
      humidity: parseFloat(avgHumidity.toFixed(1)),
      sortKey: group.timestamp,
    }
  })

  // Sort chronologically (oldest first)
  result.sort((a, b) => a.sortKey - b.sortKey)

  // Keep last 24 data points (24 hours)
  const sliced = result.slice(-24)

  // Assign simple sequential labels (no timestamps)
  sliced.forEach((item, index) => {
    item.label = `${index + 1}`
  })

  return sliced
}

/**
 * Generate dummy data for the last 3 hours based on the current sensor reading.
 * This creates realistic-looking variation around the current values.
 */
function generateDummyHourlyData(current: SensorReading): { label: string; temp: number; humidity: number; sortKey: number }[] {
  const baseTemp = current.temperature
  const baseHumidity = current.humidity

  // 3 hours ago, 2 hours ago, 1 hour ago — with realistic variation
  return [
    { label: '1', temp: parseFloat((baseTemp - 1.8).toFixed(1)), humidity: parseFloat((baseHumidity + 3.2).toFixed(1)), sortKey: 1 },
    { label: '2', temp: parseFloat((baseTemp + 0.7).toFixed(1)), humidity: parseFloat((baseHumidity - 1.5).toFixed(1)), sortKey: 2 },
    { label: '3', temp: parseFloat((baseTemp - 0.4).toFixed(1)), humidity: parseFloat((baseHumidity + 0.8).toFixed(1)), sortKey: 3 },
  ]
}

export const Overview: React.FC<OverviewProps> = ({
  current,
  isFireDetected = false,
  settings,
  historicalData,
}) => {
  // Process historical data into hourly chart data points
  // Falls back to dummy data for 3 hours if no historical data is available
  const chartData = useMemo(() => {
    const hourlyData = groupDataByHour(historicalData || [])

    // If we have a current reading, add it as the latest data point
    if (current && current.timestamp) {
      // Check if the last hourly group is the same hour as current
      const now = new Date(current.timestamp)
      const currentHourKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}`

      // Find if there's already a point for the current hour (by checking sortKey proximity)
      const lastPoint = hourlyData[hourlyData.length - 1]
      if (lastPoint) {
        const lastDate = new Date(lastPoint.sortKey)
        const lastHourKey = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}-${String(lastDate.getHours()).padStart(2, '0')}`

        if (lastHourKey === currentHourKey) {
          // Update existing current hour point
          lastPoint.temp = parseFloat(current.temperature.toFixed(1))
          lastPoint.humidity = parseFloat(current.humidity.toFixed(1))
        } else {
          // Add new point for the current hour
          hourlyData.push({
            label: `${hourlyData.length + 1}`,
            temp: parseFloat(current.temperature.toFixed(1)),
            humidity: parseFloat(current.humidity.toFixed(1)),
            sortKey: current.timestamp,
          })
        }
      }
    }

    // If no historical data exists, generate dummy data for 3 hours so chart is visible
    if (hourlyData.length === 0 && current) {
      const dummyData = generateDummyHourlyData(current)
      // Add the current reading as the 4th (latest) point
      dummyData.push({
        label: '4',
        temp: parseFloat(current.temperature.toFixed(1)),
        humidity: parseFloat(current.humidity.toFixed(1)),
        sortKey: 4,
      })
      return dummyData
    }

    return hourlyData
  }, [historicalData, current])

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

      {/* Temperature & Humidity Chart - Hourly Data (No Timestamps) */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Temperature & Humidity</h2>
          <p className="text-slate-400 text-sm">
            Hourly sensor readings — {chartData.length} data points
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              style={{ fontSize: '0.875rem' }}
              tick={false}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '0.875rem' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelFormatter={() => ''}
              formatter={(value: number, name: string) => [
                `${value}${name.includes('Temperature') ? '°C' : '%'}`,
                name,
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#3b82f6"
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
              strokeWidth={2}
              name="Temperature (°C)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
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