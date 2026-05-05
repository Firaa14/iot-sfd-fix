import React, { useState } from 'react'
import { Settings as SettingsIcon, AlertTriangle, RotateCcw } from 'lucide-react'
import { SystemSettings } from '../../types'

interface SettingsProps {
  settings: SystemSettings | null
  onSettingChange: (path: string, value: any) => void
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingChange }) => {
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [showRestartWarning, setShowRestartWarning] = useState(false)
  const [showResetWarning, setShowResetWarning] = useState(false)

  const handleSettingChange = (path: string, value: any) => {
    setUnsavedChanges(true)
    onSettingChange(path, value)
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
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure automated response parameters</p>
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
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2">
              Duration the water pump remains active after fire is detected
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
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2">
              Wait time before the system can trigger after suppression
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
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2">
              Minimum water level required to operate the pump
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
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-slate-600"
            />
            <p className="text-slate-400 text-sm mt-2">
              Frequency of data updates from the ESP32 device
            </p>
          </div>

          {/* Save Changes */}
          {unsavedChanges && (
            <div className="pt-4 border-t border-slate-700">
              <button className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 rounded-lg text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          {/* Restart Device */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
            <div>
              <p className="font-medium text-white">Restart Device</p>
              <p className="text-slate-400 text-sm">Remotely reboot the ESP32 controller</p>
            </div>
            <button
              onClick={() => setShowRestartWarning(true)}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <RotateCcw size={16} className="inline mr-2" />
              Restart
            </button>
          </div>

          {/* Reset to Defaults */}
          <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
            <div>
              <p className="font-medium text-white">Reset to Defaults</p>
              <p className="text-slate-400 text-sm">Restore all settings to factory defaults</p>
            </div>
            <button
              onClick={() => setShowResetWarning(true)}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Restart Warning Modal */}
      {showRestartWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">Restart Device?</h3>
            <p className="text-slate-400 mb-6">
              This will restart the ESP32 device. The system will be offline for a few seconds.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestartWarning(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRestartWarning(false)
                  // Trigger restart
                }}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Warning Modal */}
      {showResetWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">Reset to Defaults?</h3>
            <p className="text-slate-400 mb-6">
              All custom settings will be erased and replaced with factory defaults. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetWarning(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetWarning(false)
                  // Trigger reset
                }}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
