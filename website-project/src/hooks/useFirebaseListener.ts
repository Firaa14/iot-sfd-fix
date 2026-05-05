import { useState, useEffect } from 'react'
import { Unsubscribe } from 'firebase/database'

/**
 * Custom hook for Firebase real-time listeners
 */
export const useFirebaseListener = <T>(
  subscriptionFn: (callback: (data: T) => void) => Unsubscribe,
  initialValue: T
) => {
  const [data, setData] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setLoading(true)
      console.log('[useFirebaseListener] Setting up subscription...')
      
      const unsubscribe = subscriptionFn((newData) => {
        console.log('[useFirebaseListener] Data updated:', newData)
        setData(newData)
        setLoading(false)
        setError(null)
      })

      return () => {
        console.log('[useFirebaseListener] Unsubscribing...')
        unsubscribe()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[useFirebaseListener] Error:', errorMsg)
      setError(errorMsg)
      setLoading(false)
    }
  }, [subscriptionFn])

  return { data, loading, error }
}

/**
 * Hook untuk multiple Firebase listeners
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
        const unsubscribe = subscribe((newData) => {
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
