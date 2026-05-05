import React from 'react'
import { Flame, Droplets, Zap, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { StatCardProps } from '../../types'

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  status = 'normal',
  trend,
}) => {
  const statusColors = {
    normal: 'border-slate-700 hover:border-slate-600',
    warning: 'border-yellow-600 hover:border-yellow-500 bg-yellow-500/5',
    danger: 'border-red-600 hover:border-red-500 bg-red-500/5',
  }

  return (
    <div
      className={clsx(
        'bg-slate-800/50 border rounded-lg p-6 transition-all duration-200 hover:bg-slate-800',
        statusColors[status]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-slate-4 00 text-sm font-medium">{title}</h3>
        <div className={clsx(
          'p-2 rounded-lg',
          status === 'danger' ? 'bg-red-500/20 text-red-400' :
          status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-slate-700/50 text-slate-300'
        )}>
          {icon}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div>
          <p className="text-3xl font-bold text-white">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </p>
          {unit && <p className="text-slate-400 text-sm">{unit}</p>}
        </div>
        {trend !== undefined && (
          <div className={clsx(
            'text-sm font-medium mb-1',
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
          )}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  )
}

export const HealthCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  status?: 'online' | 'offline' | 'good' | 'warning'
}> = ({ icon, label, value, status = 'good' }) => {
  const statusColors = {
    online: 'text-green-400',
    offline: 'text-red-400',
    good: 'text-green-400',
    warning: 'text-yellow-400',
  }

  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className={clsx('font-semibold', statusColors[status])}>
          {value}
        </p>
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  label?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    NORMAL: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✓' },
    ALERT: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '⚠' },
    WARNING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '!' },
    IDLE: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: '—' },
    ON: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '◉' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NORMAL

  return (
    <span className={clsx('px-3 py-1 rounded-full border text-sm font-medium', config.color)}>
      {config.icon} {label || status}
    </span>
  )
}
