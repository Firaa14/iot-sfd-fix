import { useEffect, useState } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { getDatabase, ref, onValue } from 'firebase/database'

/**
 * Firebase Connection Monitor Component
 * Shows real-time connection status
 * Helps debug listener persistence issues
 */
export const FirebaseConnectionMonitor: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString())

  useEffect(() => {
    try {
      const database = getDatabase()
      const connectedRef = ref(database, '.info/connected')

      console.log('[ConnectionMonitor] 📡 Starting Firebase connection monitoring...')

      // Listen for connection changes
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        const isConnected = snapshot.val() === true
        console.log('[ConnectionMonitor] Connection status:', isConnected)
        setStatus(isConnected ? 'connected' : 'disconnected')
        setLastUpdate(new Date().toLocaleTimeString())
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

  const statusConfig = {
    connected: {
      icon: Wifi,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      text: 'Connected',
      dot: 'bg-green-500',
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      text: 'Disconnected',
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
