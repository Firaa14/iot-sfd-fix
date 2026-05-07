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
    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }))
    }
  }

  const validateField = (path: string, value: any): string => {
    switch (path) {
      case 'device/name':
        if (!value.trim()) return 'Device name is required'
        if (value.length < 3) return 'Device name must be at least 3 characters'
        if (value.length > 50) return 'Device name must be less than 50 characters'
        break
      case 'device/id':
        if (!value.trim()) return 'Device ID is required'
        if (!/^[A-Z0-9-_]+$/i.test(value)) return 'Device ID can only contain letters, numbers, hyphens, and underscores'
        break
      case 'device/location':
        if (!value.trim()) return 'Location is required'
        break
      case 'account/sessionTimeout':
        if (value < 5) return 'Session timeout must be at least 5 minutes'
        if (value > 480) return 'Session timeout cannot exceed 8 hours'
        break
      case 'account/activityTimeout':
        if (value < 5) return 'Activity timeout must be at least 5 minutes'
        if (value > 120) return 'Activity timeout cannot exceed 2 hours'
        break
      case 'automation/temperatureThreshold':
        if (value < 30) return 'Temperature threshold must be at least 30°C'
        if (value > 100) return 'Temperature threshold cannot exceed 100°C'
        break
      case 'automation/smokeThreshold':
        if (value < 100) return 'Smoke threshold must be at least 100'
        if (value > 1000) return 'Smoke threshold cannot exceed 1000'
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
    // Validate all fields
    const newErrors: {[key: string]: string} = {}

    // Validate device settings
    Object.keys(settings.device).forEach(key => {
      const error = validateField(`device/${key}`, settings.device[key as keyof typeof settings.device])
      if (error) newErrors[`device/${key}`] = error
    })

    // Validate account settings
    Object.keys(settings.account).forEach(key => {
      const error = validateField(`account/${key}`, settings.account[key as keyof typeof settings.account])
      if (error) newErrors[`account/${key}`] = error
    })

    // Validate automation settings
    Object.keys(settings.automation).forEach(key => {
      if (key === 'waterLevelThreshold') {
        // Skip nested object validation for now
        return
      }
      const error = validateField(`automation/${key}`, settings.automation[key as keyof typeof settings.automation])
      if (error) newErrors[`automation/${key}`] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Save changes
    setUnsavedChanges(false)
    setSuccessMessage('Settings saved successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleResetDefault = () => {
    const defaultSettings: SystemSettings = {
      device: {
        name: 'SmartFire Detector',
        id: 'SFD-001',
        location: 'Warehouse A',
        timezone: 'Asia/Jakarta',
      },
      account: {
        sessionTimeout: 60,
        autoLogout: true,
        activityTimeout: 30,
      },
      automation: {
        waterLevelThreshold: {
          normal: { min: 2, max: 6 },
          alert: { min: 6.1, max: 8 },
          empty: { min: 8.1, max: 100 },
        },
        temperatureThreshold: 50,
        smokeThreshold: 300,
        autoPumpActivation: true,
        notificationEnabled: true,
      },
      hardware: {
        pumpControl: false,
        buzzerControl: false,
        ledControl: false,
      },
    }

    // Reset all settings to default
    Object.keys(defaultSettings).forEach(section => {
      const sectionKey = section as keyof typeof defaultSettings
      const sectionData = defaultSettings[sectionKey]

      if (typeof sectionData === 'object' && sectionData !== null) {
        Object.keys(sectionData).forEach(key => {
          const path = `${section}/${key}`
          const value = (sectionData as any)[key]
          onSettingChange(path, value)
        })
      }
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

      {/* Device Settings Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Device Settings</h2>
            <p className="text-slate-400 text-sm">Configure device identification and basic parameters</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Device Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Device Name
            </label>
            <input
              type="text"
              value={settings.device.name}
              onChange={(e) => handleFieldChange('device/name', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['device/name'] ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="Enter device name"
            />
            {errors['device/name'] && (
              <p className="text-red-400 text-sm mt-2">{errors['device/name']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Display name for this device (3-50 characters)
            </p>
          </div>

          {/* Device ID */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Device ID
            </label>
            <input
              type="text"
              value={settings.device.id}
              onChange={(e) => handleFieldChange('device/id', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['device/id'] ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="Enter device ID"
            />
            {errors['device/id'] && (
              <p className="text-red-400 text-sm mt-2">{errors['device/id']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Unique identifier for this device (letters, numbers, hyphens, underscores only)
            </p>
          </div>

          {/* Device Location */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Location
            </label>
            <input
              type="text"
              value={settings.device.location}
              onChange={(e) => handleFieldChange('device/location', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['device/location'] ? 'border-red-500' : 'border-slate-700'
              }`}
              placeholder="Enter device location"
            />
            {errors['device/location'] && (
              <p className="text-red-400 text-sm mt-2">{errors['device/location']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Physical location where this device is installed
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Timezone
            </label>
            <select
              value={settings.device.timezone}
              onChange={(e) => handleSettingChange('device/timezone', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              <option value="UTC">UTC</option>
            </select>
            <p className="text-slate-400 text-sm mt-2">
              Timezone for device timestamps and scheduling
            </p>
          </div>
        </div>
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

      {/* Automation Settings Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Automation Settings</h2>
            <p className="text-slate-400 text-sm">Configure system automation and thresholds</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Water Level Threshold */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Water Level Threshold (cm)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Normal (Min-Max)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.automation.waterLevelThreshold.normal.min}
                    onChange={(e) => handleSettingChange('automation/waterLevelThreshold.normal.min', parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.automation.waterLevelThreshold.normal.max}
                    onChange={(e) => handleSettingChange('automation/waterLevelThreshold.normal.max', parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Alert (Min-Max)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.automation.waterLevelThreshold.alert.min}
                    onChange={(e) => handleSettingChange('automation/waterLevelThreshold.alert.min', parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={settings.automation.waterLevelThreshold.alert.max}
                    onChange={(e) => handleSettingChange('automation/waterLevelThreshold.alert.max', parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Empty (Min)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={settings.automation.waterLevelThreshold.empty.min}
                  onChange={(e) => handleSettingChange('automation/waterLevelThreshold.empty.min', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Water level ranges for status monitoring: Normal (green), Alert (yellow), Empty (red)
            </p>
          </div>

          {/* Temperature Threshold */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Temperature Threshold (°C)
            </label>
            <input
              type="number"
              min="30"
              max="100"
              value={settings.automation.temperatureThreshold}
              onChange={(e) => handleFieldChange('automation/temperatureThreshold', parseInt(e.target.value))}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['automation/temperatureThreshold'] ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {errors['automation/temperatureThreshold'] && (
              <p className="text-red-400 text-sm mt-2">{errors['automation/temperatureThreshold']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Temperature threshold for fire detection (30-100°C)
            </p>
          </div>

          {/* Smoke Threshold */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Smoke Threshold
            </label>
            <input
              type="number"
              min="100"
              max="1000"
              value={settings.automation.smokeThreshold}
              onChange={(e) => handleFieldChange('automation/smokeThreshold', parseInt(e.target.value))}
              className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors['automation/smokeThreshold'] ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {errors['automation/smokeThreshold'] && (
              <p className="text-red-400 text-sm mt-2">{errors['automation/smokeThreshold']}</p>
            )}
            <p className="text-slate-400 text-sm mt-2">
              Smoke sensor threshold for fire detection (100-1000)
            </p>
          </div>

          {/* Auto Pump Activation */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Auto Pump Activation
              </label>
              <p className="text-slate-400 text-sm">
                Automatically activate water pump when fire is detected
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.automation.autoPumpActivation}
                onChange={(e) => handleSettingChange('automation/autoPumpActivation', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notification Enabled */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                System Notifications
              </label>
              <p className="text-slate-400 text-sm">
                Enable system notifications for alerts and events
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.automation.notificationEnabled}
                onChange={(e) => handleSettingChange('automation/notificationEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Hardware Control Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Hardware Control</h2>
            <p className="text-slate-400 text-sm">Manually control system components for testing</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Manual Pump Trigger */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
            <div>
              <p className="font-medium text-white flex items-center gap-2">
                <Droplets size={18} className="text-blue-400" />
                Manual Pump Trigger
              </p>
              <p className="text-slate-400 text-sm">Activate water pump for testing (max 60 seconds)</p>
            </div>
            <button
              onClick={() => setShowManualPumpWarning(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 border border-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Trigger'}
            </button>
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
