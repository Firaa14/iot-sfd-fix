import { initializeApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  onValue,
  set,
  query,
  orderByChild,
  startAt,
  endAt,
  Unsubscribe,
} from 'firebase/database'
import { SensorReading, FirebaseEvent, SystemSettings } from '../types'

// ========== Firebase Configuration ==========
// Replace with your Firebase credentials
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  databaseURL: (import.meta as any).env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT.firebaseio.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Disable logging for performance
database.app.automaticDataCollectionEnabled = false

console.log('[Firebase] 🔥 Initialized with REAL-TIME listeners (NO caching)', {
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
})

// ========== Firebase Service Functions ==========

/**
 * Listen to real-time sensor data with LOCAL TIME CONVERSION
 * Only subscribe to 'sensors/current' - single point read, minimal overhead
 */
export const subscribeSensorData = (callback: (data: SensorReading) => void): Unsubscribe => {
  const sensorRef = ref(database, 'sensors/current')

  console.log('[Firebase] 📡 SUBSCRIBING to real-time sensor data (PERSISTENT, LOCAL TIME)...')

  return onValue(
    sensorRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as SensorReading
        // Convert server timestamp to local time for display
        const localTime = data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()

        console.log(`[Firebase] ✅ Sensor data LIVE UPDATE [${localTime}]:`, {
          temperature: data.temperature,
          humidity: data.humidity,
          flame: data.flameSensor,
          pump: data.pumpState,
          waterLevel: data.waterLevel,
          serverUpdateTime: localTime,
        })

        // Add local time to the data object
        const dataWithLocalTime = {
          ...data,
          localTime: localTime,
        }

        callback(dataWithLocalTime)
      } else {
        console.warn('[Firebase] ⚠️ No sensor data at sensors/current')
      }
    },
    (error: any) => {
      console.error('[Firebase] ❌ Sensor data error:', error?.code || 'UNKNOWN', error?.message || String(error))
    },
    { onlyOnce: false } // CRITICAL: Ensure continuous listening
  )
}

/**
 * Listen to device information (OPTIMIZED)
 */
export const subscribeDeviceInfo = (callback: (data: any) => void): Unsubscribe => {
  const deviceRef = ref(database, 'device')
  console.log('[Firebase] 📱 SUBSCRIBING to device info (PERSISTENT)...')
  
  return onValue(
    deviceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        console.log('[Firebase] ✅ Device info update:', snapshot.val())
        callback(snapshot.val())
      }
    },
    (error: any) => {
      console.error('[Firebase] ❌ Device info error:', error?.code || 'UNKNOWN', error?.message || String(error))
    },
    { onlyOnce: false }
  )
}

/**
 * Listen to system health (OPTIMIZED)
 */
export const subscribeSystemHealth = (callback: (data: any) => void): Unsubscribe => {
  const healthRef = ref(database, 'systemHealth')
  console.log('[Firebase] 💚 SUBSCRIBING to system health (PERSISTENT)...')
  
  return onValue(
    healthRef,
    (snapshot) => {
      if (snapshot.exists()) {
        console.log('[Firebase] ✅ Health update:', snapshot.val())
        callback(snapshot.val())
      }
    },
    (error: any) => {
      console.error('[Firebase] ❌ Health error:', error?.code || 'UNKNOWN', error?.message || String(error))
    },
    { onlyOnce: false }
  )
}

/**
 * Listen to events with date range filtering (UNLIMITED)
 * Uses onValue with orderByChild('timestamp') and date range queries
 * No limitToLast - shows all events in selected date range
 */
export const subscribeEvents = (
  callback: (data: FirebaseEvent[]) => void,
  dateRange?: { start: Date; end: Date }
): Unsubscribe => {
  const eventsRef = ref(database, 'events')

  let eventsQuery
  if (dateRange) {
    // Convert dates to timestamps for Firebase query
    const startTimestamp = dateRange.start.getTime()
    const endTimestamp = dateRange.end.getTime()

    eventsQuery = query(
      eventsRef,
      orderByChild('timestamp'),
      startAt(startTimestamp),
      endAt(endTimestamp)
    )

    console.log('[Firebase] 📋 SUBSCRIBING to events with DATE RANGE:', {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
      startTimestamp,
      endTimestamp
    })
  } else {
    // No date range - get all events (unlimited)
    eventsQuery = query(
      eventsRef,
      orderByChild('timestamp')
    )

    console.log('[Firebase] 📋 SUBSCRIBING to ALL events (UNLIMITED, ordered by timestamp)...')
  }

  return onValue(
    eventsQuery,
    (snapshot) => {
      if (snapshot.exists()) {
        const events: FirebaseEvent[] = []
        snapshot.forEach((child) => {
          const eventData = child.val()
          events.push({
            id: child.key || '',
            timestamp: eventData.timestamp || Date.now(),
            type: eventData.type || 'UNKNOWN',
            status: eventData.status || 'NORMAL',
            details: eventData.details || '',
            source: eventData.source || 'UNKNOWN',
            ...eventData,
          })
        })

        // Sort by timestamp descending (newest first)
        const sortedEvents = events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        console.log(`[Firebase] ✅ Events real-time update: ${sortedEvents.length} events`)
        if (sortedEvents.length > 0) {
          console.log('[Firebase] 📌 Latest event:', sortedEvents[0]?.type, 'at', new Date(sortedEvents[0]?.timestamp).toLocaleString())
        }
        callback(sortedEvents)
      } else {
        console.log('[Firebase] ℹ️ No events in selected range')
        callback([])
      }
    },
    (error: any) => {
      console.error('[Firebase] ❌ Events error:', error?.code || 'UNKNOWN', error?.message || String(error))
      callback([])
    },
    { onlyOnce: false }
  )
}

/**
 * Listen to historical sensor data with DATE RANGE FILTERING and LOCAL TIME CONVERSION
 * Real-time subscription to sensors/history with optional date filtering
 */
export const subscribeHistoricalData = (
  callback: (data: any[]) => void,
  _dateRange?: { start: Date; end: Date } // Kept for API compatibility - currently uses current sensor data
): Unsubscribe => {
  // USE sensors/history for historical data
  const historyRef = ref(database, 'sensors/history')

  console.log('[Firebase] 📊 SUBSCRIBING to sensors/history (REAL-TIME historical data)...')

  return onValue(
    historyRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const historyData: any[] = []
        snapshot.forEach((child) => {
          const data = child.val()
          // Convert server timestamp to local time
          const localTime = data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()

          historyData.push({
            id: child.key,
            timestamp: data.timestamp || Date.now(),
            localTime: localTime,
            temperature: data.temperature,
            humidity: data.humidity,
            flameSensor: data.flameSensor,
            pumpState: data.pumpState,
            waterLevel: data.waterLevel,
            waterVolume: data.waterVolume,
            servoPosition: data.servoPosition,
            ...data,
          })
        })

        // Sort by timestamp descending (newest first)
        const sortedData = historyData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

        console.log(`[Firebase] ✅ Historical data real-time update: ${sortedData.length} records`)
        if (sortedData.length > 0) {
          console.log('[Firebase] 📌 Latest historical record:', {
            temperature: sortedData[0]?.temperature,
            timestamp: sortedData[0]?.localTime,
            flame: sortedData[0]?.flameSensor
          })
        }

        callback(sortedData)
      } else {
        console.log('[Firebase] ℹ️ No historical data at sensors/history')
        callback([])
      }
    },
    (error: any) => {
      console.error('[Firebase] ❌ Historical data error:', error?.code || 'UNKNOWN', error?.message || String(error))
      callback([])
    },
    { onlyOnce: false } // CRITICAL: Ensure continuous listening for real-time updates
  )
}

/**
 * Listen to fire incidents counter (REALTIME)
 * Counts total fire detected events from Firebase events collection
 */
export const subscribeFireIncidents = (callback: (count: number) => void): Unsubscribe => {
  const eventsRef = ref(database, 'events')

  console.log('[Firebase] 🔥 SUBSCRIBING to fire incidents counter (REALTIME)...')

  return onValue(
    eventsRef,
    (snapshot) => {
      let fireCount = 0

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const eventData = child.val()
          // Count events where type is FIRE_DETECTED or status indicates fire
          if (eventData.type === 'FIRE_DETECTED' ||
              eventData.status === 'ALERT' ||
              eventData.flameSensor === 'DETECTED' ||
              eventData.fire === true ||
              eventData.fireDetected === true) {
            fireCount++
          }
        })
      }

      console.log(`[Firebase] 🔥 Fire incidents count: ${fireCount}`)
      callback(fireCount)
    },
    (error: any) => {
      console.error('[Firebase] ❌ Fire incidents error:', error?.code || 'UNKNOWN', error?.message || String(error))
      callback(0)
    },
    { onlyOnce: false }
  )
}

/**
 * Get historical data (One-time read, not persistent)
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
        console.log('[Firebase] 📊 History data loaded:', data.length, 'records')
        callback(data)
      } else {
        callback([])
      }
      resolve()
    }, { onlyOnce: true }) // One-time read
  })
}

/**
 * Update system settings
 */
export const updateSettings = async (settings: Partial<SystemSettings>): Promise<void> => {
  try {
    const settingsRef = ref(database, 'settings')
    console.log('[Firebase] 🔄 Updating settings:', settings)
    await set(settingsRef, settings)
    console.log('[Firebase] ✅ Settings updated successfully')
  } catch (error) {
    console.error('[Firebase] ❌ Error updating settings:', error)
    throw error
  }
}

/**
 * Update individual setting
 */
export const updateSetting = async (path: string, value: any): Promise<void> => {
  try {
    const settingRef = ref(database, `settings/${path}`)
    console.log(`[Firebase] 🔄 Updating setting [${path}]:`, value)
    await set(settingRef, value)
    console.log(`[Firebase] ✅ Setting [${path}] updated successfully`)
  } catch (error) {
    console.error(`[Firebase] ❌ Error updating setting [${path}]:`, error)
    throw error
  }
}

/**
 * Create event (for manual triggers and logging)
 * Events are logged with real-time timestamp
 */
export const createEvent = async (event: Omit<FirebaseEvent, 'id'>): Promise<void> => {
  try {
    const timestamp = Date.now()
    const eventKey = timestamp
    const eventRef = ref(database, `events/${eventKey}`)
    
    const eventData = {
      ...event,
      timestamp: timestamp, // Use Firebase client timestamp
      createdAt: new Date().toISOString(),
    }
    
    console.log('[Firebase] 📝 Creating event:', event.type, eventData)
    await set(eventRef, eventData)
    console.log('[Firebase] ✅ Event created successfully')
  } catch (error) {
    console.error('[Firebase] ❌ Error creating event:', error)
    throw error
  }
}

/**
 * Manually trigger pump
 */
export const triggerPump = async (duration: number): Promise<void> => {
  try {
    console.log('[Firebase] 💧 Triggering pump for', duration, 'seconds')
    await createEvent({
      type: 'MANUAL_PUMP_TRIGGER',
      status: 'NORMAL',
      details: `Manual pump trigger for ${duration} seconds`,
      source: 'WEB_DASHBOARD',
      timestamp: Date.now(),
    })
    console.log('[Firebase] ✅ Pump trigger event sent')
  } catch (error) {
    console.error('[Firebase] ❌ Error triggering pump:', error)
    throw error
  }
}

/**
 * Restart device
 */
export const restartDevice = async (): Promise<void> => {
  try {
    console.log('[Firebase] 🔄 Requesting device restart')
    await createEvent({
      type: 'RESTART_REQUEST',
      status: 'NORMAL',
      details: 'Device restart requested from web dashboard',
      source: 'WEB_DASHBOARD',
      timestamp: Date.now(),
    })
    console.log('[Firebase] ✅ Restart request sent')
  } catch (error) {
    console.error('[Firebase] ❌ Error requesting restart:', error)
    throw error
  }
}

export default {
  subscribeSensorData,
  subscribeDeviceInfo,
  subscribeSystemHealth,
  subscribeEvents,
  subscribeHistoricalData,
  subscribeFireIncidents,
  getHistoricalData,
  updateSettings,
  updateSetting,
  createEvent,
  triggerPump,
  restartDevice,
}
