import React from 'react'
import { Thermometer, Droplets, Flame, Activity, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { SensorReading, SystemSettings } from '../../types'
import { StatCard, StatusBadge } from '../Shared/Cards'

interface LiveMonitorProps {
  current: SensorReading | null
  isFireDetected?: boolean
  settings?: SystemSettings | null
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ current, isFireDetected = false, settings }) => {
  const getWaterLevelStatus = () => {
    if (!current || !settings) return null

    const threshold = settings.automation.waterLevelThreshold

    // Normal: 2cm to threshold
    if (current.waterLevel >= 2 && current.waterLevel <= threshold) return 'normal'

    // Warning: threshold+0.1 to threshold+2
    if (current.waterLevel > threshold && current.waterLevel <= threshold + 2) return 'warning'

    // Critical: > threshold+2
    if (current.waterLevel > threshold + 2) return 'critical'

    return null
  }

  const waterStatus = getWaterLevelStatus()

  // Force re-render when settings change
  React.useEffect(() => {
    // This effect ensures the component re-renders when settings change
  }, [settings])

  if (!current) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className={clsx('p-6 space-y-6', isFireDetected && 'bg-gradient-to-br from-red-950/30 to-slate-950')}>
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

      {/* ALERT Status Banner */}
      {waterStatus === 'warning' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 shadow-sm transition-all duration-500 ease-in-out animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300">Warning Detected</h3>
              <p className="text-yellow-200 text-sm">System detected abnormal condition</p>
            </div>
          </div>
        </div>
      )}

      {/* Water Level Critical Banner */}
      {waterStatus === 'critical' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 shadow-sm transition-all duration-500 ease-in-out animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-300">Water Tank Empty</h3>
              <p className="text-red-200 text-sm">Please refill the water tank immediately</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Monitor</h1>
        <p className="text-slate-400">Real-time sensor readings & system status</p>
      </div>

      {/* Zone Info & System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={clsx('border rounded-lg p-6', isFireDetected ? 'bg-red-600/20 border-red-500' : 'bg-slate-800/50 border-slate-700')}>
          <p className="text-slate-400 text-sm mb-2">MONITORING ZONE</p>
          <p className="text-3xl font-bold text-white mb-4">Warehouse A</p>
          <div className="flex items-center gap-2">
            <div className={clsx('w-3 h-3 rounded-full animate-pulse', isFireDetected ? 'bg-red-500' : 'bg-green-500')} />
            <span className={isFireDetected ? 'text-red-400' : 'text-green-400'}>{isFireDetected ? 'ALERT - FIRE DETECTED' : 'SAFE - NORMAL'}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">LAST UPDATE</p>
          <p className="text-2xl font-bold text-white mb-2">{new Date(current.timestamp).toLocaleTimeString()}</p>
          <p className="text-slate-400 text-xs">Update frekuensi: Real-time (Firebase Listener)</p>
        </div>
      </div>

      {/* Main Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Temperature"
          value={current.temperature}
          unit="°C"
          icon={<Thermometer size={24} />}
          status={current.temperature > 35 ? 'danger' : current.temperature > 30 ? 'warning' : 'normal'}
        />
        <StatCard
          title="Humidity"
          value={current.humidity}
          unit="%"
          icon={<Droplets size={24} />}
          status={current.humidity > 80 ? 'warning' : 'normal'}
        />
        <StatCard
          title="Water Level"
          value={current.waterLevel}
          unit="cm"
          icon={<Droplets size={24} />}
          status={current.waterLevel < 10 ? 'warning' : 'normal'}
        />
        <StatCard
          title="Flame Sensor"
          value={current.flameSensor}
          icon={<Flame size={24} />}
          status={isFireDetected ? 'danger' : 'normal'}
        />
      </div>

      {/* Detailed Sensor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Temperature Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Thermometer size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Temperature</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Current:</span>
              <span className="font-semibold text-white">{current.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <StatusBadge status={current.temperature > 35 ? 'ALERT' : 'NORMAL'} label="Optimal" />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">DHT22 Sensor</p>
            </div>
          </div>
        </div>

        {/* Humidity Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
              <Droplets size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Humidity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Current:</span>
              <span className="font-semibold text-white">{current.humidity.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <StatusBadge status={current.humidity > 80 ? 'WARNING' : 'NORMAL'} label="Normal" />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">DHT22 Sensor</p>
            </div>
          </div>
        </div>

        {/* Water Level Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400">
              <Droplets size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Water Level</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Distance:</span>
              <span className="font-semibold text-white">{current.waterLevel.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume:</span>
              <span className="font-semibold text-white">{current.waterVolume.toFixed(0)} mL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <StatusBadge
                status={
                  !settings ? 'NORMAL' :
                  current.waterLevel >= 2 && current.waterLevel <= settings.automation.waterLevelThreshold ? 'NORMAL' :
                  current.waterLevel > settings.automation.waterLevelThreshold && current.waterLevel <= settings.automation.waterLevelThreshold + 2 ? 'WARNING' :
                  current.waterLevel > settings.automation.waterLevelThreshold + 2 ? 'CRITICAL' : 'UNKNOWN'
                }
                label={
                  !settings ? 'Loading...' :
                  current.waterLevel >= 2 && current.waterLevel <= settings.automation.waterLevelThreshold ? `Normal (2-${settings.automation.waterLevelThreshold}cm)` :
                  current.waterLevel > settings.automation.waterLevelThreshold && current.waterLevel <= settings.automation.waterLevelThreshold + 2 ? `Alert (${(settings.automation.waterLevelThreshold + 0.1).toFixed(1)}-${(settings.automation.waterLevelThreshold + 2).toFixed(1)}cm)` :
                  current.waterLevel > settings.automation.waterLevelThreshold + 2 ? `Empty (>${(settings.automation.waterLevelThreshold + 2).toFixed(1)}cm)` : 'Unknown'
                }
              />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">Ultrasonic Sensor</p>
            </div>
          </div>
        </div>

        {/* Flame Sensor Details */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${current.flameSensor === 'DETECTED' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              <Flame size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Flame Sensor</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <StatusBadge status={current.flameSensor === 'DETECTED' ? 'ALERT' : 'NORMAL'} label={current.flameSensor} />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">IR Flame Detector</p>
            </div>
          </div>
        </div>

        {/* Pump State */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${current.pumpState === 'ON' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
              <Droplets size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Pump State</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <StatusBadge status={current.pumpState} />
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">Relay Control</p>
            </div>
          </div>
        </div>

        {/* Servo Position */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Servo Position</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Angle:</span>
              <span className="font-semibold text-white">{current.servoPosition}°</span>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">Range: 0° - 180°</p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-right text-slate-400 text-sm">
        Last update: {new Date(current.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

export default LiveMonitor
