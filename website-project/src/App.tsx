import { useState } from 'react'
import { Layout } from './components/Layout/Layout'
import { Overview } from './components/Overview/Overview'
import { LiveMonitor } from './components/LiveMonitor/LiveMonitor'
import { History } from './components/History/History'
import { EventLog } from './components/EventLog/EventLog'
import { Settings } from './components/Settings/Settings'
import {
  subscribeSensorData,
  subscribeDeviceInfo,
  subscribeSystemHealth,
  subscribeEvents,
  subscribeSettings,
  updateSetting,
} from './services/firebase'
import { useFirebaseListener } from './hooks/useFirebaseListener'
import { SensorReading, FirebaseEvent, SystemSettings } from './types'

function App() {
  const [currentPage, setCurrentPage] = useState('overview')

  // Firebase listeners
  const { data: sensorData, loading: sensorLoading, error: sensorError } = useFirebaseListener(
    subscribeSensorData,
    null as SensorReading | null
  )

  const { data: deviceInfo } = useFirebaseListener(subscribeDeviceInfo, null)
  const { data: systemHealth } = useFirebaseListener(subscribeSystemHealth, null)
  const { data: events } = useFirebaseListener(subscribeEvents, [] as FirebaseEvent[])
  const { data: settings } = useFirebaseListener(
    subscribeSettings,
    null as SystemSettings | null
  )

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

  const handleSettingChange = async (path: string, value: any) => {
    try {
      await updateSetting(path, value)
    } catch (error) {
      console.error('Failed to update setting:', error)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <Overview
            current={sensorData}
            device={deviceInfo}
            health={systemHealth}
            recentEvents={events}
          />
        )
      case 'live-monitor':
        return <LiveMonitor current={sensorData} />
      case 'history':
        return <History current={sensorData} />
      case 'event-log':
        return <EventLog events={events} />
      case 'settings':
        return (
          <Settings settings={settings} onSettingChange={handleSettingChange} />
        )
      default:
        return <Overview current={sensorData} device={deviceInfo} health={systemHealth} recentEvents={events} />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

export default App
