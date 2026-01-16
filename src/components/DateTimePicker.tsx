import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import WheelColumn from './WheelColumn'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">选择日期时间</h3>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium"
          >
            确定
          </button>
        </div>

        {/* 滚轮选择区域 */}
        <div className="flex-1 flex flex-col relative" style={{ height: '400px', minHeight: '400px' }}>
          <div className="flex flex-1 overflow-hidden relative">
            {/* 选中指示线 - 横跨所有列，定位在滚轮区域的中间位置 */}
            <div 
              className="absolute left-0 right-0 h-[50px] border-t-2 border-b-2 border-orange-500 pointer-events-none z-20" 
              style={{ 
                top: '191px'
              }} 
            />
            
            {/* 使用独立的 WheelColumn 组件 */}
            <WheelColumn
              label="年"
              items={years}
              value={selectedYear}
              onChange={handleYearChange}
              scrollMultiplier={8}
              formatNumber={(num) => String(num)}
            />
            
            <WheelColumn
              label="月"
              items={months}
              value={selectedMonth}
              onChange={handleMonthChange}
              scrollMultiplier={4}
              formatNumber={formatNumber}
            />
            
            <WheelColumn
              label="日"
              items={days}
              value={selectedDay}
              onChange={setSelectedDay}
              scrollMultiplier={5}
              formatNumber={formatNumber}
            />
            
            <WheelColumn
              label="时"
              items={hours}
              value={selectedHour}
              onChange={setSelectedHour}
              scrollMultiplier={5}
              formatNumber={formatNumber}
            />
            
            <WheelColumn
              label="分"
              items={minutes}
              value={selectedMinute}
              onChange={setSelectedMinute}
              scrollMultiplier={4}
              formatNumber={formatNumber}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
