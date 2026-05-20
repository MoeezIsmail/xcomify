import { createContext, useContext, useState, useEffect } from 'react'
import { settingsAPI } from '../lib/api'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = () => {
    settingsAPI.get()
      .then((res) => setSettings(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSettings() }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
