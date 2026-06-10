import React, { useState } from 'react'
import { Settings as SettingsIcon, AlertTriangle, RotateCcw, Zap, Droplets, Shield, RefreshCw } from 'lucide-react'
import { SystemSettings } from '../../types'
import { restartDevice, triggerPump } from '../../services/firebase'

interface SettingsProps {
  settings: SystemSettings
  onSettingChange: (path: string, value: any) => void
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingChange }) => {
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [showRestartWarning, setShowRestartWarning] = useState(false)
  const [showManualPumpWarning, setShowManualPumpWarning] = useState(false)
  const [manualPumpDuration, setManualPumpDuration] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleSettingChange = (path: string, value: any) => {
    setUnsavedChanges(true)
    onSettingChange(path, value)
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }))
    }
  }

  const validateField = (path: string, value: any): string => {
    switch (path) {
      case 'account/sessionTimeout':
        if (value < 5) return 'Session timeout must be at least 5 minutes'
        if (value > 480) return 'Session timeout cannot exceed 8 hours'
        break
      case 'account/activityTimeout':
        if (value < 5) return 'Activity timeout must be at least 5 minutes'
        if (value > 120) return 'Activity timeout cannot exceed 2 hours'
        break
    }
    return ''
  }

  const handleFieldChange = (path: string, value: any) => {
    const error = validateField(path, value)
    setErrors(prev => ({ ...prev, [path]: error }))
    handleSettingChange(path, value)
  }

  const handleSaveChanges = () => {
    const newErrors: {[key: string]: string} = {}

    Object.keys(settings.account).forEach(key => {
      const error = validateField(`account/${key}`, settings.account[key as keyof typeof settings.account])
      if (error) newErrors[`account/${key}`] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setUnsavedChanges(false)
    setSuccessMessage('Settings saved successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleResetDefault = () => {
    const defaultSettings = {
      account: {
        sessionTimeout: 60,
        autoLogout: true,
        activityTimeout: 30,
      },
    }

    Object.keys(defaultSettings.account).forEach(key => {
      onSettingChange(`account/${key}`, defaultSettings.account[key as keyof typeof defaultSettings.account])
    })

    setUnsavedChanges(true)
    setErrors({})
    setSuccessMessage('Settings reset to default!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleRestartDevice = async () => {
    setIsLoading(true)
    try {
      await restartDevice()
      setSuccessMessage('Restart command sent to device!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to restart device:', error)
      alert('Failed to send restart command')
    } finally {
      setIsLoading(false)
      setShowRestartWarning(false)
    }
  }

  const handleManualPumpTrigger = async () => {
    setIsLoading(true)
    try {
      await triggerPump(manualPumpDuration)
      setSuccessMessage(`Pump activated for ${manualPumpDuration} seconds!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to trigger pump:', error)
      alert('Failed to activate pump')
    } finally {
      setIsLoading(false)
      setShowManualPumpWarning(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400">
          ✓ {successMessage}
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure device settings, account security, and system parameters</p>
      </div>

      {/* Account & Security Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Account & Security</h2>
            <p className="text-slate-400 text-sm">Manage account security and session settings</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={settings.account.sessionTimeout}
              onChange={(e) => handleFieldChange('account/sessionTimeout', parseInt(e.target.value))}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['account/sessionTimeout'] ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {errors['account/sessionTimeout'] && (
              <p className="text-red-400 text-sm mt-2">{errors['account/sessionTimeout']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Auto-logout after inactivity (5-480 minutes)
            </p>
          </div>

          {/* Activity Timeout */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Activity Timeout (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.account.activityTimeout}
              onChange={(e) => handleFieldChange('account/activityTimeout', parseInt(e.target.value))}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['account/activityTimeout'] ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {errors['account/activityTimeout'] && (
              <p className="text-red-400 text-sm mt-2">{errors['account/activityTimeout']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Time before considering user inactive (5-120 minutes)
            </p>
          </div>

          {/* Auto Logout */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Auto Logout
              </label>
              <p className="text-slate-400 text-sm">
                Automatically log out users after session timeout
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.account.autoLogout}
                onChange={(e) => handleSettingChange('account/autoLogout', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Device Control Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Device Control</h2>
            <p className="text-slate-400 text-sm">Advanced device management options</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Restart Device */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
            <div>
              <p className="font-medium text-white flex items-center gap-2">
                <RotateCcw size={18} className="text-orange-400" />
                Restart Device
              </p>
              <p className="text-slate-400 text-sm">Remotely reboot the ESP32 controller</p>
            </div>
            <button
              onClick={() => setShowRestartWarning(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 border border-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Restart'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {unsavedChanges && (
          <button
            onClick={handleSaveChanges}
            className="px-6 py-2 bg-green-600 border border-green-500 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ✓ Save Changes
          </button>
        )}
        <button
          onClick={handleResetDefault}
          className="px-6 py-2 bg-slate-600 border border-slate-500 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Reset to Default
        </button>
      </div>

      {/* Manual Pump Warning Modal */}
      {showManualPumpWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Trigger Manual Pump</h3>
            <p className="text-slate-400 mb-6">
              Specify how long the pump should run for testing purposes.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Duration (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={manualPumpDuration}
                onChange={(e) => setManualPumpDuration(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-slate-500 text-xs mt-2">1-60 seconds</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowManualPumpWarning(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleManualPumpTrigger}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart Warning Modal */}
      {showRestartWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Restart Device?</h3>
            <p className="text-slate-400 mb-6">
              The ESP32 device will be restarted. System will be offline for a few seconds.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestartWarning(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestartDevice}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings