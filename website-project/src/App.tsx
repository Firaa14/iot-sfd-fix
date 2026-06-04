import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Overview } from './components/Overview/Overview'
import { LiveMonitor } from './components/LiveMonitor/LiveMonitor'
import { History } from './components/History/History'
import { EventLog } from './components/EventLog/EventLog'
import { Settings } from './components/Settings/Settings'
import { Login } from './components/Login/Login'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { AuthProvider, useAuth } from './auth/AuthContext'
import {
  subscribeSensorData,
  subscribeDeviceInfo,
  subscribeSystemHealth,
  subscribeEvents,
  subscribeHistoricalData,
  subscribeFireIncidents,
} from './services/firebase'
import { useFirebaseListener } from './hooks/useFirebaseListener'
import { useEventHistory } from './hooks/useEventHistory'
import { SensorReading, FirebaseEvent, SystemSettings } from './types'

interface DashboardContainerProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  sensorData: SensorReading | null
  deviceInfo: any
  systemHealth: any
  events: FirebaseEvent[]
  isFireDetected: boolean
  settings: SystemSettings
  historicalData: any[]
  fireIncidentsCount: number
  setHistoryDateRange: React.Dispatch<React.SetStateAction<{ start: Date; end: Date } | undefined>>
  handleSettingChange: (path: string, value: any) => void
  eventHistoryEvents: FirebaseEvent[]
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  activeTab,
  onTabChange,
  sensorData,
  deviceInfo,
  systemHealth,
  events,
  isFireDetected,
  settings,
  historicalData,
  fireIncidentsCount,
  setHistoryDateRange,
  handleSettingChange,
  eventHistoryEvents,
}) => {
  // Scroll to top of main content area on tab change
  React.useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.scrollTop = 0
    }
  }, [activeTab])

  // CSS Tab Wrapper - absolute positions inactive tabs off-screen to preserve size metrics for Recharts
  const getTabClass = (isActive: boolean) =>
    isActive
      ? 'w-full h-auto relative opacity-100 transition-opacity duration-150'
      : 'absolute -left-[9999px] top-0 w-full h-0 pointer-events-none opacity-0 overflow-hidden'

  return (
    <Layout activeTab={activeTab} onTabChange={onTabChange}>
      <div className="relative w-full h-full">
        <div className={getTabClass(activeTab === 'overview')}>
          <Overview
            current={sensorData}
            device={deviceInfo}
            health={systemHealth}
            recentEvents={events}
            isFireDetected={isFireDetected}
            settings={settings}
          />
        </div>

        <div className={getTabClass(activeTab === 'live-monitor')}>
          <LiveMonitor
            current={sensorData}
            isFireDetected={isFireDetected}
            settings={settings}
          />
        </div>

        <div className={getTabClass(activeTab === 'history')}>
          <History
            historicalData={historicalData}
            fireIncidentsCount={fireIncidentsCount}
            onDateRangeChange={setHistoryDateRange}
          />
        </div>

        <div className={getTabClass(activeTab === 'event-log')}>
          <EventLog events={eventHistoryEvents} />
        </div>

        <div className={getTabClass(activeTab === 'settings')}>
          <Settings
            settings={settings}
            onSettingChange={handleSettingChange}
          />
        </div>
      </div>
    </Layout>
  )
}

// Main App Component (inside AuthProvider)
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<string>(
    () => localStorage.getItem('active_dashboard_tab') || 'overview'
  )

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    localStorage.setItem('active_dashboard_tab', tabId)
  }

  const [historyDateRange, setHistoryDateRange] = useState<{ start: Date; end: Date } | undefined>()
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [fireIncidentsCount, setFireIncidentsCount] = useState<number>(0)

  // Event history hook for append-only persistence
  const eventHistory = useEventHistory()

  // Firebase listeners
  const { data: sensorData, loading: sensorLoading, error: sensorError } = useFirebaseListener(
    subscribeSensorData,
    null as SensorReading | null
  )

  const { data: deviceInfo } = useFirebaseListener(subscribeDeviceInfo, null)
  const { data: systemHealth } = useFirebaseListener(subscribeSystemHealth, null)
  const { data: events } = useFirebaseListener(subscribeEvents, [] as FirebaseEvent[])

  // Settings state management
  const [settings, setSettings] = useState<SystemSettings>({
    device: {
      name: 'SmartFire Detector',
      id: 'SFD-001',
      location: 'Warehouse A',
      timezone: 'Asia/Jakarta',
    },
    account: {
      sessionTimeout: 60,
      autoLogout: true,
      activityTimeout: 30,
    },
    automation: {
      waterLevelThreshold: {
        normal: { min: 2, max: 6 },
        alert: { min: 6.1, max: 8 },
        empty: { min: 8.1, max: 100 },
      },
      temperatureThreshold: 50,
      smokeThreshold: 300,
      autoPumpActivation: true,
      notificationEnabled: true,
    },
    hardware: {
      pumpControl: false,
      buzzerControl: false,
      ledControl: false,
    },
  })

  // Historical data subscription with date range filtering
  React.useEffect(() => {
    const unsubscribe = subscribeHistoricalData((data) => {
      setHistoricalData(data)
    }, historyDateRange)

    return unsubscribe
  }, [historyDateRange])

  // Fire incidents counter subscription
  React.useEffect(() => {
    const unsubscribe = subscribeFireIncidents((count) => {
      setFireIncidentsCount(count)
    })

    return unsubscribe
  }, [])

  // Merge real-time events into event history (append-only)
  React.useEffect(() => {
    if (events && events.length > 0) {
      eventHistory.mergeEvents(events)
    }
  }, [events, eventHistory])

  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.')
      const newSettings = { ...prev }
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  // Show debug info while loading
  if (sensorLoading) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-red-500 mb-4 text-6xl">🔥</div>
          <p className="text-white text-xl font-semibold">Connecting to Firebase...</p>
          {sensorError && <p className="text-red-500 text-sm mt-2">Error: {sensorError}</p>}
        </div>
      </div>
    )
  }

  // Check if fire is detected
  const isFireDetected = sensorData?.flameSensor === 'DETECTED'

  return (
    <Router>
      <Routes>
        {/* Public route - Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardContainer
                activeTab={activeTab}
                onTabChange={handleTabChange}
                sensorData={sensorData}
                deviceInfo={deviceInfo}
                systemHealth={systemHealth}
                events={events}
                isFireDetected={isFireDetected}
                settings={settings}
                historicalData={historicalData}
                fireIncidentsCount={fireIncidentsCount}
                setHistoryDateRange={setHistoryDateRange}
                handleSettingChange={handleSettingChange}
                eventHistoryEvents={eventHistory.events}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

// Root App Component with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App