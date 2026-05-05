import React, { useMemo } from 'react'
import { Activity, Clock, FileText, Settings, BarChart3, Flame } from 'lucide-react'
import clsx from 'clsx'

interface SidebarLink {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

interface LayoutProps {
  currentPage: string
  onPageChange: (page: string) => void
  children: React.ReactNode
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { id: 'overview', label: 'Overview', icon: <Activity size={20} />, href: '#' },
  { id: 'live-monitor', label: 'Live Monitor', icon: <BarChart3 size={20} />, href: '#' },
  { id: 'history', label: 'History', icon: <Clock size={20} />, href: '#' },
  { id: 'event-log', label: 'Event Log', icon: <FileText size={20} />, href: '#' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, href: '#' },
]

export const Layout: React.FC<LayoutProps> = ({ currentPage, onPageChange, children }) => {
  // Memoize sidebar links dan logo agar tidak re-render
  const sidebarContent = useMemo(() => (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-hidden flex-shrink-0">
      {/* Logo Section - NEVER CHANGES */}
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Flame size={24} className="text-white font-bold" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">SmartFire</h1>
            <p className="text-slate-400 text-xs">Warehouse System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - PERSISTENT */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {SIDEBAR_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onPageChange(link.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
              currentPage === link.id
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            )}
          >
            {link.icon}
            <span className="font-medium whitespace-nowrap">{link.label}</span>
          </button>
        ))}
      </nav>

      {/* Device Info Footer - ALWAYS VISIBLE */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0 text-slate-500 text-xs">
        <p>Device: ESP32-WH-01-21</p>
        <p>v2.4.1-stable</p>
      </div>
    </aside>
  ), [currentPage, onPageChange])

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden">
      {/* PERSISTENT SIDEBAR - NEVER MOVES OR RE-RENDERS */}
      {sidebarContent}

      {/* CONTENT AREA - DYNAMIC */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default Layout
