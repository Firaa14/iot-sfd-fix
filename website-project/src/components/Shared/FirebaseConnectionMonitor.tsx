import { useEffect, useState } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { getDatabase, ref, onValue } from 'firebase/database'
import { SensorReading } from '../../types'

interface FirebaseConnectionMonitorProps {
  sensorData: SensorReading | null
  deviceInfo?: any
}

/**
 * Firebase Connection Monitor Component
 * Shows real-time connection status of the IoT Device
 */
export const FirebaseConnectionMonitor: React.FC<FirebaseConnectionMonitorProps> = ({ sensorData, deviceInfo }) => {
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false)
  const [status, setStatus] = useState<'online' | 'offline' | 'connecting'>('connecting')
  const [lastSeenState, setLastSeenState] = useState<string | null>(null)
  const [lastChangeTime, setLastChangeTime] = useState<number>(0)
  const [lastUpdate, setLastUpdate] = useState<string>('-')
  const [connectTime, setConnectTime] = useState<number>(0)

  useEffect(() => {
    try {
      const database = getDatabase()
      const connectedRef = ref(database, '.info/connected')

      console.log('[ConnectionMonitor] 📡 Starting Firebase connection monitoring...')

      // Listen for Firebase connection status
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        const isConnected = snapshot.val() === true
        console.log('[ConnectionMonitor] Firebase connection status:', isConnected)
        setFirebaseConnected(isConnected)
        if (isConnected) {
          setConnectTime(Date.now())
          setStatus('connecting')
        } else {
          setStatus('offline')
        }
      })

      // Cleanup
      return () => {
        console.log('[ConnectionMonitor] 🛑 Stopping Firebase connection monitoring')
        unsubscribe()
      }
    } catch (error) {
      console.error('[ConnectionMonitor] Error setting up connection monitor:', error)
    }
  }, [])

  // Evaluate IoT device connection based on changes in sensorData or deviceInfo (handles millis() and clock mismatches)
  useEffect(() => {
    if (!sensorData && !deviceInfo) return

    const currentSensorTs = sensorData?.timestamp
    const currentDeviceUpdate = deviceInfo?.lastUpdate
    const currentDeviceHeartbeat = deviceInfo?.lastHeartbeat

    // Create a composite state identifier
    const stateId = `${currentSensorTs}-${currentDeviceUpdate}-${currentDeviceHeartbeat}`

    if (lastSeenState === null) {
      // First load: store state
      setLastSeenState(stateId)
      
      // Fallback: If it's a real absolute Unix timestamp and is recent, mark Online immediately
      let isRecent = false
      let timeString = '-'
      if (currentSensorTs) {
        if (currentSensorTs > 1000000000000) {
          // Milliseconds
          isRecent = Date.now() - currentSensorTs < 15000
          timeString = new Date(currentSensorTs).toLocaleTimeString()
        } else if (currentSensorTs > 1000000000) {
          // Seconds
          isRecent = (Date.now() / 1000) - currentSensorTs < 15
          timeString = new Date(currentSensorTs * 1000).toLocaleTimeString()
        }
      }

      if (isRecent) {
        setStatus('online')
        setLastChangeTime(Date.now())
        setLastUpdate(timeString)
      }
    } else if (stateId !== lastSeenState) {
      // State updated: new data has actively arrived from the IoT device
      setStatus('online')
      setLastSeenState(stateId)
      setLastChangeTime(Date.now())
      setLastUpdate(new Date().toLocaleTimeString())
    }
  }, [sensorData, deviceInfo, lastSeenState])

  // Periodic evaluation of status timeouts
  useEffect(() => {
    const checkDeviceStatus = () => {
      if (!firebaseConnected) {
        setStatus('offline')
        return
      }

      if (status === 'online') {
        // If we haven't seen any state changes in 15 seconds, mark offline
        if (lastChangeTime > 0 && Date.now() - lastChangeTime > 15000) {
          setStatus('offline')
        }
      } else if (status === 'connecting') {
        // If we've been connecting for 15 seconds without receiving any update, mark offline
        if (connectTime > 0 && Date.now() - connectTime > 15000) {
          setStatus('offline')
        }
      }
    }

    checkDeviceStatus()
    const interval = setInterval(checkDeviceStatus, 2000)

    return () => clearInterval(interval)
  }, [firebaseConnected, status, lastChangeTime, connectTime])

  const statusConfig = {
    online: {
      icon: Wifi,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      text: 'Online',
      dot: 'bg-green-500',
    },
    offline: {
      icon: WifiOff,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      text: 'Offline',
      dot: 'bg-red-500',
    },
    connecting: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
      text: 'Connecting...',
      dot: 'bg-yellow-500 animate-pulse',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded text-xs ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className={`${config.color} font-semibold`}>{config.text}</span>
      <span className="text-slate-500 ml-auto">{lastUpdate}</span>
    </div>
  )
}


