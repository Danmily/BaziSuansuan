import { useState } from 'react'
import { Calendar, Clock, Sparkles, Briefcase } from 'lucide-react'
import { calculateBazi, type BaziResult, getRecommendedJobs, type JobRecommendation } from '../utils/baziCalculator'
import DateTimePicker from './DateTimePicker'

function BaziCalculator() {
  const [formData, setFormData] = useState({
    gender: '男',
    birthDateTime: ''
  })
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null)
  const [jobRecommendation, setJobRecommendation] = useState<JobRecommendation | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.birthDateTime) {
      alert('请选择出生日期和时间')
      return
    }

    const [date, time] = formData.birthDateTime.split(' ')
    if (!date || !time) {
      alert('请选择完整的出生日期和时间')
      return
    }

    const result = calculateBazi(date, time)
    setBaziResult(result)
    
    // 计算职业推荐
    if (result) {
      const recommendation = getRecommendedJobs(result)
      setJobRecommendation(recommendation)
    } else {
      setJobRecommendation(null)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateTimeConfirm = (date: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      birthDateTime: `${date} ${time}`
    }))
  }

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '请选择出生日期和时间'
    const [date, time] = dateTime.split(' ')
    if (!date || !time) return '请选择出生日期和时间'
    
    const [year, month, day] = date.split('-')
    const [hour, minute] = time.split(':')
    
    // 格式：2000/04/16 17:25（24小时制）
    return `${year}/${month}/${day} ${hour}:${minute}`
  }

  const getCurrentDate = () => {
    if (!formData.birthDateTime) return ''
    const [date] = formData.birthDateTime.split(' ')
    return date || ''
  }

  const getCurrentTime = () => {
    if (!formData.birthDateTime) return ''
    const [, time] = formData.birthDateTime.split(' ')
    return time || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            八字排盘・职业分析系统
            <Sparkles className="w-6 h-6 text-red-500" />
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            精准计算·真太阳时·职业规划·人生指导
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 性别字段 */}
            <div>
              <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-2">
                性别
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 出生日期时间字段 - 合并 */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                出生日期
              </label>
              <div
                onClick={() => setIsPickerOpen(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all cursor-pointer hover:border-orange-400 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className={`${formData.birthDateTime ? 'text-gray-800' : 'text-gray-400'}`}>
                    {formatDateTime(formData.birthDateTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              开始分析
            </button>
          </form>

          {/* 八字排盘结果显示 */}
          {baziResult && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">八字排盘结果</h2>
              
              {/* 八字四柱显示 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* 年柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">年柱</div>
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {baziResult.year.tianGan}
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {baziResult.year.diZhi}
                    </div>
                  </div>
                </div>

                {/* 月柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">月柱</div>
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {baziResult.month.tianGan}
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {baziResult.month.diZhi}
                    </div>
                  </div>
                </div>

                {/* 日柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">日柱</div>
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {baziResult.day.tianGan}
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {baziResult.day.diZhi}
                    </div>
                  </div>
                </div>

                {/* 时柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">时柱</div>
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {baziResult.hour.tianGan}
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {baziResult.hour.diZhi}
                    </div>
                  </div>
                </div>
              </div>

              {/* 完整八字显示 */}
              <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
                <div className="text-lg text-gray-700 mb-2">完整八字</div>
                <div className="text-2xl font-bold text-gray-800">
                  {baziResult.year.tianGan}{baziResult.year.diZhi} · 
                  {baziResult.month.tianGan}{baziResult.month.diZhi} · 
                  {baziResult.day.tianGan}{baziResult.day.diZhi} · 
                  {baziResult.hour.tianGan}{baziResult.hour.diZhi}
                </div>
              </div>

              {/* 职业推荐 */}
              {jobRecommendation && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">职业推荐</h3>
                  </div>
                  
                  <div className="text-gray-700 mb-4">
                    {jobRecommendation.suggestion}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {jobRecommendation.industries.map((industry, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {industry}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 日期时间选择器 */}
      <DateTimePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleDateTimeConfirm}
        initialDate={getCurrentDate()}
        initialTime={getCurrentTime()}
      />
    </div>
  )
}

export default BaziCalculator
