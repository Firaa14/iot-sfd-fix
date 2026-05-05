import React, { useState } from 'react'
import { Calendar, X } from 'lucide-react'

interface DateRangePickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (startDate: Date, endDate: Date) => void
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ isOpen, onClose, onConfirm }) => {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])

  const handleConfirm = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      alert('Start date harus lebih kecil dari end date')
      return
    }

    onConfirm(start, end)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Pilih Rentang Tanggal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Date Inputs */}
        <div className="space-y-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
          <p className="text-xs text-slate-400 mb-2">Ringkasan Filter:</p>
          <p className="text-sm text-white">
            <span className="font-semibold">{startDate}</span> hingga <span className="font-semibold">{endDate}</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg text-white hover:bg-blue-700 transition-colors font-medium"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  )
}
