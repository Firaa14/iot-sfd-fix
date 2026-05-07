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
import { SensorReading, FirebaseEvent, SystemSettings } from './types'

// Main App Component (inside AuthProvider)
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [historyDateRange, setHistoryDateRange] = useState<{ start: Date; end: Date } | undefined>()
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [fireIncidentsCount, setFireIncidentsCount] = useState<number>(0)

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
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Overview
                        current={sensorData}
                        device={deviceInfo}
                        health={systemHealth}
                        recentEvents={events}
                        isFireDetected={isFireDetected}
                        settings={settings}
                      />
                    }
                  />
                  <Route
                    path="/live-monitor"
                    element={
                      <LiveMonitor
                        current={sensorData}
                        isFireDetected={isFireDetected}
                        settings={settings}
                      />
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <History
                        historicalData={historicalData}
                        fireIncidentsCount={fireIncidentsCount}
                        onDateRangeChange={setHistoryDateRange}
                      />
                    }
                  />
                  <Route
                    path="/event-log"
                    element={<EventLog events={events} />}
                  />
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        settings={settings}
                        onSettingChange={handleSettingChange}
                      />
                    }
                  />
                  {/* Redirect unknown routes to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
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