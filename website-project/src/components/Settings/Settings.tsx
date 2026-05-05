import React, { useState } from 'react'
import { Settings as SettingsIcon, AlertTriangle, RotateCcw, Zap, Droplets } from 'lucide-react'
import { SystemSettings } from '../../types'
import { restartDevice, triggerPump } from '../../services/firebase'

interface SettingsProps {
  settings: SystemSettings | null
  onSettingChange: (path: string, value: any) => void
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingChange }) => {
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [showRestartWarning, setShowRestartWarning] = useState(false)
  const [showResetWarning, setShowResetWarning] = useState(false)
  const [showManualPumpWarning, setShowManualPumpWarning] = useState(false)
  const [manualPumpDuration, setManualPumpDuration] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSettingChange = (path: string, value: any) => {
    setUnsavedChanges(true)
    onSettingChange(path, value)
  }

  const handleRestartDevice = async () => {
    setIsLoading(true)
    try {
      await restartDevice()
      setSuccessMessage('Perintah restart dikirim ke perangkat!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to restart device:', error)
      alert('Gagal mengirim perintah restart')
    } finally {
      setIsLoading(false)
      setShowRestartWarning(false)
    }
  }

  const handleManualPumpTrigger = async () => {
    setIsLoading(true)
    try {
      await triggerPump(manualPumpDuration)
      setSuccessMessage(`Pompa diaktifkan selama ${manualPumpDuration} detik!`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to trigger pump:', error)
      alert('Gagal mengaktifkan pompa')
    } finally {
      setIsLoading(false)
      setShowManualPumpWarning(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">Loading settings...</p>
      </div>
    )
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
        <p className="text-slate-400">Configure automated response parameters & control hardware</p>
      </div>

      {/* Automated Suppression Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Automated Suppression</h2>
            <p className="text-slate-400 text-sm">Configure how the system responds to fire detection</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Spray Duration */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Spray Duration (Seconds)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.automation.sprayDuration}
              onChange={(e) =>
                handleSettingChange('automation/sprayDuration', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-400 text-sm mt-2">
              Duration the water pump remains active after fire is detected (5-60 seconds)
            </p>
          </div>

          {/* Cooldown Period */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Cooldown Period (Seconds)
            </label>
            <input
              type="number"
              min="60"
              max="600"
              value={settings.automation.cooldownPeriod}
              onChange={(e) =>
                handleSettingChange('automation/cooldownPeriod', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-400 text-sm mt-2">
              Wait time before the system can trigger again (60-600 seconds)
            </p>
          </div>

          {/* Water Level Threshold */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Water Level Threshold (cm)
            </label>
            <input
              type="number"
              min="5"
              max="20"
              value={settings.automation.waterLevelThreshold}
              onChange={(e) =>
                handleSettingChange('automation/waterLevelThreshold', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-400 text-sm mt-2">
              Minimum water level required to operate pump (5-20 cm)
            </p>
          </div>

          {/* Telemetry Interval */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Telemetry Interval (Seconds)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.automation.telemetryInterval}
              onChange={(e) =>
                handleSettingChange('automation/telemetryInterval', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-400 text-sm mt-2">
              Frequency of sensor data updates (1-60 seconds)
            </p>
          </div>

          {/* Save Changes */}
          {unsavedChanges && (
            <div className="pt-4 border-t border-slate-700">
              <button className="px-6 py-2 bg-green-600 border border-green-500 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                ✓ Simpan Perubahan
              </button>
            </div>
          )}
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
                Batal
              </button>
              <button
                onClick={handleManualPumpTrigger}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Konfirmasi'}
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
              Perangkat ESP32 akan di-restart. Sistem akan offline beberapa detik.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestartWarning(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Batal
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
