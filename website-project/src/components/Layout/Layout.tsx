import React, { useState } from 'react'
import { Menu, X, Activity, Clock, FileText, Settings, BarChart3 } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside
        className={clsx(
          'bg-slate-900 border-r border-slate-800 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🔥</span>
              </div>
              <div className={clsx(!sidebarOpen && 'hidden')}>
                <h1 className="text-white font-bold text-lg">SmartFire</h1>
                <p className="text-slate-400 text-xs">Warehouse System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onPageChange(link.id)
                  setSidebarOpen(false)
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  currentPage === link.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                )}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <p className="text-slate-500 text-xs">Device: ESP32-WH-01-21</p>
            <p className="text-slate-500 text-xs">v2.4.1-stable</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
              <span>👤</span>
            </div>
            <span className="font-medium">Admin User</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
