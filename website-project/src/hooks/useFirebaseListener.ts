import { useState, useEffect, useRef } from 'react'
import { Unsubscribe } from 'firebase/database'

/**
 * Custom hook for Firebase real-time listeners
 * Ensures listener persists and doesn't re-subscribe on re-renders
 */
export const useFirebaseListener = <T>(
  subscriptionFn: (callback: (data: T) => void) => Unsubscribe,
  initialValue: T
) => {
  const [data, setData] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use refs to ensure subscription functions are stable
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const isSubscribedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      console.log('[useFirebaseListener] Already subscribed, skipping...')
      return
    }

    try {
      console.log('[useFirebaseListener] Setting up PERSISTENT subscription...')
      isSubscribedRef.current = true
      
      // Create stable callback that won't change
      const handleDataUpdate = (newData: T) => {
        console.log('[useFirebaseListener] Real-time data update received:', new Date().toISOString(), newData)
        setData(newData)
        setLoading(false)
        setError(null)
      }

      // Subscribe once
      unsubscribeRef.current = subscriptionFn(handleDataUpdate)

      // Cleanup on unmount only
      return () => {
        console.log('[useFirebaseListener] Component unmounting, unsubscribing...')
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
          isSubscribedRef.current = false
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useFirebaseListener] Subscription error:', errorMsg)
      setError(errorMsg)
      setLoading(false)
      isSubscribedRef.current = false
    }
    // IMPORTANT: Empty dependency array - subscribe ONCE on mount only
  }, [])

  return { data, loading, error }
}

/**
 * Hook untuk multiple Firebase listeners
 * Each listener runs independently and persists
 */
export const useMultipleFirebaseListeners = <T extends Record<string, any>>(
  subscriptions: {
    [K in keyof T]: {
      subscribe: (callback: (data: T[K]) => void) => Unsubscribe
      initialValue: T[K]
    }
  }
): { data: T; loading: boolean; error: string | null } => {
  const [data, setData] = useState<T>(() => {
    const initial = {} as T
    Object.keys(subscriptions).forEach((key) => {
      initial[key as keyof T] = subscriptions[key as keyof T].initialValue
    })
    return initial
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribes: Unsubscribe[] = []

    try {
      Object.entries(subscriptions).forEach(([key, { subscribe }]) => {
        const unsubscribe = subscribe((newData: any) => {
          setData((prev) => ({
            ...prev,
            [key]: newData,
          }))
          setLoading(false)
        })
        unsubscribes.push(unsubscribe)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub())
    }
  }, [subscriptions])

  return { data, loading, error }
}
