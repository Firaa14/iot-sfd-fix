import { useState, useCallback, useEffect } from 'react'
import { FirebaseEvent } from '../types'

const STORAGE_KEY = 'event_log_history_2026'
const MAX_EVENTS = 2000

export const useEventHistory = () => {
  const [events, setEvents] = useState<FirebaseEvent[]>([])

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setEvents(parsed)
        console.log('[useEventHistory] 📦 Loaded from localStorage:', parsed.length, 'events')
      }
    } catch (error) {
      console.error('[useEventHistory] ❌ Error loading from localStorage:', error)
    }
  }, [])

  // Save events to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
      console.log('[useEventHistory] 💾 Saved to localStorage:', events.length, 'events')
    } catch (error) {
      console.error('[useEventHistory] ❌ Error saving to localStorage:', error)
    }
  }, [events])

  // Add single event with duplicate prevention
  const addEvent = useCallback((event: FirebaseEvent) => {
    setEvents(prev => {
      // Check if event already exists by ID
      if (event.id && prev.some(e => e.id === event.id)) {
        return prev
      }

      // Check if event already exists by composite key (timestamp + type + source)
      if (prev.some(e => e.timestamp === event.timestamp && e.type === event.type && e.source === event.source)) {
        return prev
      }

      // Add new event (keep max events to prevent localStorage overflow)
      const updated = [event, ...prev].slice(0, MAX_EVENTS)
      return updated
    })
  }, [])

  // Merge multiple events (batch add from Firebase)
  const mergeEvents = useCallback((newEvents: FirebaseEvent[]) => {
    setEvents(prev => {
      let merged = [...prev]

      // Add each new event if it doesn't already exist
      for (const newEvent of newEvents) {
        const exists =
          merged.some(e => e.id && e.id === newEvent.id) ||
          merged.some(e => e.timestamp === newEvent.timestamp && e.type === newEvent.type && e.source === newEvent.source)

        if (!exists) {
          merged.unshift(newEvent)
        }
      }

      // Keep max events
      return merged.slice(0, MAX_EVENTS)
    })
  }, [])

  // Get events (optionally limited)
  const getEvents = useCallback((limit?: number) => {
    return limit ? events.slice(0, limit) : events
  }, [events])

  // Clear history
  const clearHistory = useCallback(() => {
    setEvents([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    events,
    addEvent,
    mergeEvents,
    getEvents,
    clearHistory,
  }
}
