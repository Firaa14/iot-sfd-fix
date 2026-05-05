import React from 'react'
import { Flame, AlertTriangle, Wifi, Clock } from 'lucide-react'
import clsx from 'clsx'
import { SensorReading, SystemHealth, DeviceInfo } from '../../types'

interface NavbarProps {
  isFireDetected: boolean
  current: SensorReading | null
  health: SystemHealth | null
  device: DeviceInfo | null
}

export const Navbar: React.FC<NavbarProps> = ({ isFireDetected, current, health, device }) => {
  const getLastUpdateTime = () => {
    if (!current) return 'N/A'
    const diff = Date.now() - current.timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <>
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full',
          isFireDetected
            ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 shadow-lg shadow-red-500/50'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700'
        )}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Left: Logo & System Name */}
          <div className="flex items-center gap-4 flex-1">
            <div
              className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 flex-shrink-0',
                isFireDetected
                  ? 'bg-white text-red-600 shadow-lg shadow-red-500/50 animate-pulse'
                  : 'bg-red-500 text-white'
              )}
            >
              <Flame size={24} className={isFireDetected ? 'animate-bounce' : ''} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-white text-lg">SmartFire Detector</h1>
              <p className="text-xs text-gray-200 opacity-80">Warehouse Monitoring System</p>
            </div>
          </div>

          {/* Center: Fire Alert Status */}
          {isFireDetected && (
            <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 mx-4 animate-pulse hidden md:flex">
              <AlertTriangle size={20} className="text-yellow-200 animate-bounce flex-shrink-0" />
              <span className="font-bold text-white text-sm whitespace-nowrap">🚨 WASPADA - API TERDETEKSI! 🚨</span>
            </div>
          )}

          {/* Right: Status Indicators */}
          <div className="flex items-center gap-4 md:gap-6 text-sm flex-shrink-0">
            {/* Device Status */}
            <div className="flex items-center gap-2 text-gray-100">
              <div className={clsx(
                'w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0',
                device?.online ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400'
              )} />
              <span className="hidden lg:inline text-xs whitespace-nowrap">{device?.online ? 'Online' : 'Offline'}</span>
            </div>

            {/* WiFi Signal */}
            <div className="flex items-center gap-2 text-gray-100">
              <Wifi size={16} className={clsx('flex-shrink-0', health?.signalStrength ?? 0 > 70 ? 'text-green-400' : 'text-yellow-400')} />
              <span className="hidden lg:inline text-xs whitespace-nowrap">{health?.signalStrength ?? 0}%</span>
            </div>

            {/* Last Update Time */}
            <div className="flex items-center gap-2 text-gray-100 px-3 py-1 bg-white/5 rounded-lg whitespace-nowrap">
              <Clock size={14} className="flex-shrink-0" />
              <span className="text-xs">{getLastUpdateTime()}</span>
            </div>

            {/* Water Level Warning */}
            {current && current.waterLevel < 10 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hidden sm:flex">
                <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />
                <span className="text-xs text-yellow-300 whitespace-nowrap">Water Low</span>
              </div>
            )}
          </div>
        </div>

        {/* Fire Alert Banner - Full Width */}
        {isFireDetected && (
          <div className="bg-red-600/80 backdrop-blur-sm border-b-2 border-red-400 overflow-hidden">
            <div className="px-6 py-3 animate-pulse">
              <div className="flex items-center gap-3 justify-center flex-wrap">
                <Flame size={20} className="text-yellow-200 animate-bounce" />
                <div className="text-center">
                  <p className="font-bold text-white text-base md:text-lg">🔥 API TERDETEKSI DI SISTEM! 🔥</p>
                  <p className="text-xs md:text-sm text-red-100 mt-1">Sistem penyiram otomatis sedang beraksi. Jangan dekati area bahaya!</p>
                </div>
                <AlertTriangle size={20} className="text-yellow-200 animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
