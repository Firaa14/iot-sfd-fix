import React, { useMemo } from 'react'
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
import { ArrowUp, ArrowDown } from 'lucide-react'

interface HistoryProps {
  historicalData: any[]
  fireIncidentsCount: number
  onDateRangeChange?: (dateRange: { start: Date; end: Date } | undefined) => void
}

// Generate realistic dummy sensor data for display when no real data is available
function generateDummyData() {
  const data = []
  for (let i = 0; i < 24; i++) {
    // Temperature: simulate day/night cycle (cooler at night, warmer at midday)
    const hourFactor = Math.sin(((i - 6) / 24) * Math.PI * 2) // peaks around hour 12
    const baseTemp = 29.5 + hourFactor * 4.5 // range ~25°C to ~34°C
    const temp = parseFloat((baseTemp + (Math.random() - 0.5) * 1.5).toFixed(1))

    // Humidity: inversely related to temperature with some noise
    const baseHumidity = 66 - hourFactor * 11 // higher when cooler
    const humidity = parseFloat((baseHumidity + (Math.random() - 0.5) * 5).toFixed(1))

    // Water level: slow drift with minor fluctuations
    const baseWater = 13 + Math.sin((i / 24) * Math.PI) * 5
    const waterLevel = parseFloat((baseWater + (Math.random() - 0.5) * 2).toFixed(1))

    // Flame sensor: mostly clear, occasional detection
    const flame = (i === 8 || i === 17) ? 1 : 0

    data.push({
      label: `${i + 1}`,
      temp,
      humidity,
      waterLevel,
      flame,
      sortKey: i,
    })
  }
  return data
}

export const History: React.FC<HistoryProps> = ({
  historicalData,
}) => {
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
      console.log('[History] ℹ️ No historical data available — using dummy data')
    }
  }, [historicalData])

  // Process historical data grouped by hour (no timestamps displayed)
  // Falls back to dummy data when no real historical data is available
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      // No real data available — use realistic dummy data as fallback
      console.log('[History] 📈 Using dummy data for chart display')
      return generateDummyData()
    }

    // Real data is available — use it (priority always given to real data)
    console.log('[History] ✅ Using real sensor data for chart display')

    // Group by hour
    const hourlyMap = new Map<string, {
      temps: number[]
      humidities: number[]
      waterLevels: number[]
      flameValues: number[]
      timestamp: number
    }>()

    historicalData.forEach((record) => {
      const ts = typeof record.timestamp === 'string'
        ? new Date(record.timestamp).getTime()
        : record.timestamp
      if (!ts) return

      const date = new Date(ts)
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}`

      if (!hourlyMap.has(hourKey)) {
        hourlyMap.set(hourKey, { temps: [], humidities: [], waterLevels: [], flameValues: [], timestamp: ts })
      }

      const group = hourlyMap.get(hourKey)!
      if (record.temperature != null) group.temps.push(record.temperature)
      if (record.humidity != null) group.humidities.push(record.humidity)
      if (record.waterLevel != null) group.waterLevels.push(record.waterLevel)

      // Flame sensor: DETECTED = 1, CLEAR = 0
      if (record.flameSensor != null) {
        group.flameValues.push(record.flameSensor === 'DETECTED' ? 1 : 0)
      }

      if (ts > group.timestamp) group.timestamp = ts
    })

    const result = Array.from(hourlyMap.entries()).map(([_key, group]) => {
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

      return {
        label: '',
        temp: parseFloat(avg(group.temps).toFixed(1)),
        humidity: parseFloat(avg(group.humidities).toFixed(1)),
        waterLevel: parseFloat(avg(group.waterLevels).toFixed(1)),
        flame: parseFloat(avg(group.flameValues).toFixed(2)),
        sortKey: group.timestamp,
      }
    })

    result.sort((a, b) => a.sortKey - b.sortKey)
    const sliced = result.slice(-24)
    sliced.forEach((item, index) => { item.label = `${index + 1}` })

    return sliced
  }, [historicalData])

  // Calculate Max & Min temperature from real data, fallback to dummy chart data
  const tempStats = useMemo(() => {
    if (historicalData && historicalData.length > 0) {
      const temps = historicalData
        .map((d) => d.temperature)
        .filter((t): t is number => t != null && !isNaN(t))

      if (temps.length > 0) {
        return {
          maxTemp: parseFloat(Math.max(...temps).toFixed(1)),
          minTemp: parseFloat(Math.min(...temps).toFixed(1)),
        }
      }
    }

    // Fallback: derive from chart data (which may be dummy data)
    if (chartData.length > 0) {
      const temps = chartData.map((d) => d.temp).filter((t) => t != null && !isNaN(t))
      if (temps.length > 0) {
        return {
          maxTemp: parseFloat(Math.max(...temps).toFixed(1)),
          minTemp: parseFloat(Math.min(...temps).toFixed(1)),
        }
      }
    }

    return { maxTemp: 0, minTemp: 0 }
  }, [historicalData, chartData])

  // Common chart style for tooltip
  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">History</h1>
        <p className="text-slate-400">Analyze sensor trends and system performance</p>
      </div>

      {/* Max & Min Temperature Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Max Temperature"
          value={tempStats.maxTemp}
          unit="°C"
          icon={<ArrowUp size={24} />}
          status={tempStats.maxTemp > 35 ? 'danger' : tempStats.maxTemp > 30 ? 'warning' : 'normal'}
        />
        <StatCard
          title="Min Temperature"
          value={tempStats.minTemp}
          unit="°C"
          icon={<ArrowDown size={24} />}
          status={'normal'}
        />
      </div>

      {/* Sensor Time-Series — All 3 sensors in one chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">Sensor Time-Series</h2>
          <p className="text-slate-400 text-sm">
            Flame Sensor, DHT22 (Temperature & Humidity), Ultrasonic (Water Level) — {chartData.length} data points
            {(!historicalData || historicalData.length === 0) && (
              <span className="ml-2 text-amber-400/70 text-xs">(Dummy data — waiting for real sensor readings)</span>
            )}
          </p>
        </div>

        {chartData.length === 0 ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <p className="text-slate-400">Loading sensor data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
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
                contentStyle={tooltipStyle}
                labelFormatter={() => ''}
                formatter={(value: number, name: string) => {
                  if (name === 'Flame Sensor') return [value >= 0.5 ? 'DETECTED' : 'CLEAR', name]
                  if (name.includes('Temperature')) return [`${value}°C`, name]
                  if (name.includes('Humidity')) return [`${value}%`, name]
                  if (name.includes('Water')) return [`${value} cm`, name]
                  return [`${value}`, name]
                }}
              />
              <Legend />
              {/* DHT22 — Temperature */}
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
              {/* DHT22 — Humidity */}
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
              {/* Ultrasonic — Water Level */}
              <Line
                type="monotone"
                dataKey="waterLevel"
                stroke="#06b6d4"
                dot={{ fill: '#06b6d4', r: 3 }}
                activeDot={{ r: 5 }}
                strokeWidth={2}
                name="Water Level (cm)"
                isAnimationActive={false}
              />
              {/* Flame Sensor */}
              <Line
                type="stepAfter"
                dataKey="flame"
                stroke="#ef4444"
                dot={{ fill: '#ef4444', r: 3 }}
                activeDot={{ r: 5 }}
                strokeWidth={2}
                name="Flame Sensor"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default History
