import { initializeApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  query,
  orderByChild,
  limitToLast,
  DatabaseReference,
  Unsubscribe,
} from 'firebase/database'
import { SensorReading, FirebaseEvent, SystemSettings } from '../types'

// ========== Firebase Configuration ==========
// Replace with your Firebase credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

console.log('Firebase initialized with config:', {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
})

// ========== Firebase Service Functions ==========

/**
 * Listen to real-time sensor data
 */
export const subscribeSensorData = (callback: (data: SensorReading) => void): Unsubscribe => {
  const sensorRef = ref(database, 'sensors/current')
  console.log('[Firebase] Subscribing to sensor data at:', sensorRef.path)
  
  return onValue(
    sensorRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as SensorReading
        console.log('[Firebase] Sensor data received:', data)
        callback(data)
      } else {
        console.warn('[Firebase] No sensor data available at sensors/current')
      }
    },
    (error) => {
      console.error('[Firebase] Error reading sensor data:', error)
    }
  )
}

/**
 * Listen to device information
 */
export const subscribeDeviceInfo = (callback: (data: any) => void): Unsubscribe => {
  const deviceRef = ref(database, 'device')
  return onValue(deviceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

/**
 * Listen to system health
 */
export const subscribeSystemHealth = (callback: (data: any) => void): Unsubscribe => {
  const healthRef = ref(database, 'systemHealth')
  return onValue(healthRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

/**
 * Listen to events (latest 50)
 */
export const subscribeEvents = (callback: (data: FirebaseEvent[]) => void): Unsubscribe => {
  const eventsRef = ref(database, 'events')
  const eventsQuery = query(eventsRef, orderByChild('timestamp'), limitToLast(50))

  return onValue(eventsQuery, (snapshot) => {
    if (snapshot.exists()) {
      const events: FirebaseEvent[] = []
      snapshot.forEach((child) => {
        events.push({
          id: child.key || '',
          ...child.val(),
        })
      })
      callback(events.reverse())
    } else {
      callback([])
    }
  })
}

/**
 * Listen to system settings
 */
export const subscribeSettings = (callback: (data: SystemSettings) => void): Unsubscribe => {
  const settingsRef = ref(database, 'settings')
  return onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as SystemSettings)
    }
  })
}

/**
 * Get historical data
 */
export const getHistoricalData = async (
  callback: (data: any[]) => void
): Promise<void> => {
  const historyRef = ref(database, 'sensors/history')
  return new Promise((resolve) => {
    onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data: any[] = []
        snapshot.forEach((child) => {
          data.push({
            timestamp: child.key,
            ...child.val(),
          })
        })
        callback(data)
      } else {
        callback([])
      }
      resolve()
    }, { onlyOnce: true })
  })
}

/**
 * Update system settings
 */
export const updateSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
  const settingsRef = ref(database, 'settings')
  return set(settingsRef, settings)
}

/**
 * Update individual setting
 */
export const updateSetting = async (path: string, value: any): Promise<void> => {
  const settingRef = ref(database, `settings/${path}`)
  return set(settingRef, value)
}

/**
 * Create event (for manual trigger)
 */
export const createEvent = async (event: Omit<FirebaseEvent, 'id'>): Promise<void> => {
  const eventsRef = ref(database, `events/${Date.now()}`)
  return set(eventsRef, event)
}

/**
 * Manually trigger pump
 */
export const triggerPump = async (duration: number): Promise<void> => {
  return createEvent({
    type: 'MANUAL_PUMP_TRIGGER',
    status: 'NORMAL',
    details: `Manual pump trigger for ${duration} seconds`,
    source: 'WEB_DASHBOARD',
    timestamp: Date.now(),
  })
}

/**
 * Restart device
 */
export const restartDevice = async (): Promise<void> => {
  return createEvent({
    type: 'RESTART_REQUEST',
    status: 'NORMAL',
    details: 'Device restart requested from web dashboard',
    source: 'WEB_DASHBOARD',
    timestamp: Date.now(),
  })
}

export default {
  subscribeSensorData,
  subscribeDeviceInfo,
  subscribeSystemHealth,
  subscribeEvents,
  subscribeSettings,
  getHistoricalData,
  updateSettings,
  updateSetting,
  createEvent,
  triggerPump,
  restartDevice,
}
