import { useState, useEffect, useRef, useCallback } from 'react'
import { notificationsAPI } from '../lib/api'

const POLL_MS = 6000

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const prevCountRef = useRef(-1) // -1 = not yet initialized
  const timerRef = useRef(null)
  const inFlightRef = useRef(false)

  const fetch = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      const res = await notificationsAPI.getAll()
      const data = res.data
      const list  = data.notifications || []
      const count = data.new_count    || 0

      setNotifications(list)
      setNewCount(count)

      // Fire browser notification only when count genuinely increased
      if (prevCountRef.current >= 0 && count > prevCountRef.current) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('xComify — New Notification', {
            body: list.find(n => n.is_new)?.body || `${count} new notification${count > 1 ? 's' : ''}`,
            icon: '/favicon.svg',
          })
        }
      }
      prevCountRef.current = count
    } catch {
      // ignore 401 / network errors during polling
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead()
      prevCountRef.current = 0
      setNewCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_new: false })))
      window.dispatchEvent(new Event('xcomify:notifications-changed'))
    } catch {
      // Notification state will self-correct on the next poll.
    }
  }, [])

  useEffect(() => {
    const initialFetch = window.setTimeout(fetch, 0)
    timerRef.current = setInterval(fetch, POLL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('xcomify:notifications-changed', fetch)

    return () => {
      clearTimeout(initialFetch)
      clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('xcomify:notifications-changed', fetch)
    }
  }, [fetch])

  const requestPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  return { notifications, newCount, loading, markAllRead, refresh: fetch, requestPermission }
}
