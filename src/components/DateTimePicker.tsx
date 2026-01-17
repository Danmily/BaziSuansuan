import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface DateTimePickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string, time: string) => void
  initialDate?: string
  initialTime?: string
}

export default function DateTimePicker({
  isOpen,
  onClose,
  onConfirm,
  initialDate = '',
  initialTime = ''
}: DateTimePickerProps) {
  const [selectedYear, setSelectedYear] = useState(2000)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedHour, setSelectedHour] = useState(0)
  const [selectedMinute, setSelectedMinute] = useState(0)

  // 初始化日期时间
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      if (initialDate) {
        const [year, month, day] = initialDate.split('-').map(Number)
        setSelectedYear(year || now.getFullYear())
        setSelectedMonth(month || now.getMonth() + 1)
        setSelectedDay(day || now.getDate())
      } else {
        setSelectedYear(now.getFullYear())
        setSelectedMonth(now.getMonth() + 1)
        setSelectedDay(now.getDate())
      }

      if (initialTime) {
        const [hour, minute] = initialTime.split(':').map(Number)
        setSelectedHour(hour || 0)
        setSelectedMinute(minute || 0)
      } else {
        setSelectedHour(now.getHours())
        setSelectedMinute(now.getMinutes())
      }
    }
  }, [isOpen, initialDate, initialTime])

  // 生成年份列表（1930-2026）
  const years = Array.from({ length: 97 }, (_, i) => 1930 + i)
  
  // 生成月份列表（1-12）
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  
  // 根据年月计算天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }
  
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  )
  
  // 当月份或年份变化时，确保日期不超过最大天数
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth)
    }
  }, [selectedYear, selectedMonth, daysInMonth, selectedDay])
  
  // 生成小时列表（0-23）
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  // 生成分钟列表（5的倍数：00, 05, 10, 15, ..., 55）
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  // 处理确认
  const handleConfirm = () => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    const timeStr = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
    onConfirm(dateStr, timeStr)
    onClose()
  }

  // 格式化显示
  const formatNumber = (num: number) => String(num).padStart(2, '0')
  
  // 处理年份变化
  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    const maxDay = getDaysInMonth(year, selectedMonth)
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay)
    }
  }
  
  // 处理月份变化
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
    const maxDay = getDaysInMonth(selectedYear, month)
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">选择日期时间</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 下拉选择区域 */}
        <div className="p-6 space-y-4">
          {/* 日期选择 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">年</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">月</label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {months.map(month => (
                  <option key={month} value={month}>{formatNumber(month)}月</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">日</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {days.map(day => (
                  <option key={day} value={day}>{formatNumber(day)}日</option>
                ))}
              </select>
            </div>
          </div>

          {/* 时间选择 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">时</label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{formatNumber(hour)}时</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">分</label>
              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {minutes.map(minute => (
                  <option key={minute} value={minute}>{formatNumber(minute)}分</option>
                ))}
              </select>
            </div>
          </div>

          {/* 确认按钮 */}
          <button
            onClick={handleConfirm}
            className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
