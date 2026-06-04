import React, { useMemo } from 'react'
import { Activity, FileText, Settings, BarChart3, Flame, LogOut, User } from 'lucide-react'
import clsx from 'clsx'
import { RealtimeClock } from '../Shared/RealtimeClock'
import { FirebaseConnectionMonitor } from '../Shared/FirebaseConnectionMonitor'
import { useAuth } from '../../auth/AuthContext'

interface SidebarLink {
  id: string
  label: string
  icon: React.ReactNode
}

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tabId: string) => void
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { id: 'overview', label: 'Overview', icon: <Activity size={20} /> },
  { id: 'live-monitor', label: 'Live Monitor', icon: <BarChart3 size={20} /> },
  { id: 'history', label: 'History', icon: <Flame size={20} /> },
  { id: 'event-log', label: 'Event Log', icon: <FileText size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
]

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  // Memoize sidebar links dan logo agar tidak re-render kecuali activeTab berubah
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

      {/* User Info Section */}
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Menu - PERSISTENT */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {SIDEBAR_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onTabChange(link.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left focus:outline-none',
              activeTab === link.id
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            )}
          >
            {link.icon}
            <span className="font-medium whitespace-nowrap">{link.label}</span>
          </button>
        ))}
      </nav>

      {/* Status Section - Real-time Clock & Connection Monitor */}
      <div className="p-4 space-y-3 border-t border-slate-800 flex-shrink-0">
        <RealtimeClock />
        <FirebaseConnectionMonitor />

        {/* Device Info */}
        <div className="p-3 bg-slate-800/50 rounded text-slate-400 text-xs">
          <p className="font-semibold">Device: ESP32-WH-01-21</p>
          <p>v2.4.1-stable</p>
          <p className="mt-2 text-slate-500">🔴 Real-time listeners ACTIVE</p>
        </div>
      </div>
    </aside>
  ), [activeTab, user, logout, onTabChange])

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
