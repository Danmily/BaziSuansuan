import { useState } from 'react'
import { Calendar, Clock, Sparkles } from 'lucide-react'
import { calculateBazi, type BaziResult, getRecommendedJobs, type JobRecommendation } from '../utils/baziCalculator'
import { calculateLifeKline, type LifeKlineResult } from '../utils/lifeklineCalculator'
import DateTimePicker from './DateTimePicker'
import BaziResultLayout from './BaziResultLayout'

function BaziCalculator() {
  const [formData, setFormData] = useState({
    gender: '男',
    birthDateTime: ''
  })
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null)
  const [jobRecommendation, setJobRecommendation] = useState<JobRecommendation | null>(null)
  const [lifeKline, setLifeKline] = useState<LifeKlineResult | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [showResult, setShowResult] = useState(false)

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
      
      // 计算人生K线
      const [year] = date.split('-').map(Number)
      const klineData = calculateLifeKline(result, year, formData.gender as '男' | '女')
      setLifeKline(klineData)
      
      // 切换到结果页面
      setShowResult(true)
    } else {
      setJobRecommendation(null)
      setLifeKline(null)
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

  // 如果已显示结果，切换到结果布局
  if (showResult && baziResult && jobRecommendation && lifeKline) {
    return (
      <BaziResultLayout
        baziResult={baziResult}
        jobRecommendation={jobRecommendation}
        lifeKline={lifeKline}
        birthDateTime={formData.birthDateTime}
        gender={formData.gender as '男' | '女'}
      />
    )
  }

  // 否则显示输入表单
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

          {/* 临时结果显示（在新布局之前） */}
          {baziResult && !showResult && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">八字排盘结果</h2>
              
              {/* 八字四柱显示 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* 年柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">年柱</div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md">
                    <div className={`text-3xl font-bold mb-1 ${getElementColor(baziResult.year.tianGan)}`}>
                      {baziResult.year.tianGan}
                    </div>
                    <div className={`text-3xl font-bold ${getElementColor(baziResult.year.diZhi)}`}>
                      {baziResult.year.diZhi}
                    </div>
                  </div>
                </div>

                {/* 月柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">月柱</div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md">
                    <div className={`text-3xl font-bold mb-1 ${getElementColor(baziResult.month.tianGan)}`}>
                      {baziResult.month.tianGan}
                    </div>
                    <div className={`text-3xl font-bold ${getElementColor(baziResult.month.diZhi)}`}>
                      {baziResult.month.diZhi}
                    </div>
                  </div>
                </div>

                {/* 日柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">日柱</div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md">
                    <div className={`text-3xl font-bold mb-1 ${getElementColor(baziResult.day.tianGan)}`}>
                      {baziResult.day.tianGan}
                    </div>
                    <div className={`text-3xl font-bold ${getElementColor(baziResult.day.diZhi)}`}>
                      {baziResult.day.diZhi}
                    </div>
                  </div>
                </div>

                {/* 时柱 */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">时柱</div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-md">
                    <div className={`text-3xl font-bold mb-1 ${getElementColor(baziResult.hour.tianGan)}`}>
                      {baziResult.hour.tianGan}
                    </div>
                    <div className={`text-3xl font-bold ${getElementColor(baziResult.hour.diZhi)}`}>
                      {baziResult.hour.diZhi}
                    </div>
                  </div>
                </div>
              </div>

              {/* 完整八字显示 */}
              <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
                <div className="text-lg text-gray-700 mb-2">完整八字</div>
                <div className="text-2xl font-bold">
                  <span className={getElementColor(baziResult.year.tianGan)}>{baziResult.year.tianGan}</span>
                  <span className={getElementColor(baziResult.year.diZhi)}>{baziResult.year.diZhi}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className={getElementColor(baziResult.month.tianGan)}>{baziResult.month.tianGan}</span>
                  <span className={getElementColor(baziResult.month.diZhi)}>{baziResult.month.diZhi}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className={getElementColor(baziResult.day.tianGan)}>{baziResult.day.tianGan}</span>
                  <span className={getElementColor(baziResult.day.diZhi)}>{baziResult.day.diZhi}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className={getElementColor(baziResult.hour.tianGan)}>{baziResult.hour.tianGan}</span>
                  <span className={getElementColor(baziResult.hour.diZhi)}>{baziResult.hour.diZhi}</span>
                </div>
              </div>

              {/* 身强身弱和五行得分 */}
              {jobRecommendation && (
                <>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">身强身弱分析</h3>
                    
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">日主五行</div>
                        <div className="text-2xl font-bold text-purple-600">{jobRecommendation.selfElement}</div>
                      </div>
                      <div className="text-gray-400">|</div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">日主得分</div>
                        <div className="text-2xl font-bold text-purple-600">{jobRecommendation.selfScore}分</div>
                      </div>
                      <div className="text-gray-400">|</div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">身强身弱</div>
                        <div className={`text-2xl font-bold ${jobRecommendation.bodyStrength === '身强' ? 'text-red-600' : 'text-blue-600'}`}>
                          {jobRecommendation.bodyStrength}
                        </div>
                      </div>
                    </div>

                    {/* 五行得分详情 */}
                    <div className="grid grid-cols-5 gap-3 mt-4">
                      {(['木', '火', '土', '金', '水'] as const).map((element) => {
                        const score = jobRecommendation.scores[element]
                        const isSelf = element === jobRecommendation.selfElement
                        const isStrongest = element === jobRecommendation.strongestElement
                        const isWeakest = element === jobRecommendation.weakestElement
                        
                        return (
                          <div
                            key={element}
                            className={`bg-white rounded-lg p-3 text-center ${
                              isSelf ? 'ring-2 ring-purple-500' : ''
                            } ${isStrongest ? 'ring-2 ring-green-500' : ''} ${isWeakest ? 'ring-2 ring-orange-500' : ''}`}
                          >
                            <div className="text-sm font-medium text-gray-700 mb-1">{element}</div>
                            <div className="text-lg font-bold text-gray-800">{score}分</div>
                            {isSelf && <div className="text-xs text-purple-600 mt-1">日主</div>}
                            {isStrongest && <div className="text-xs text-green-600 mt-1">最强</div>}
                            {isWeakest && <div className="text-xs text-orange-600 mt-1">最弱</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 职业推荐 */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <Briefcase className={`w-5 h-5 ${jobRecommendation.elementColors.text}`} />
                      <h3 className="text-xl font-bold text-gray-800">职业发展建议</h3>
                    </div>

                    {/* 日主五行描述 */}
                    <div className={`${jobRecommendation.elementColors.bgLight} rounded-lg p-4 mb-6 border ${jobRecommendation.elementColors.border}`}>
                      <div className={`text-lg font-semibold ${jobRecommendation.elementColors.textDark} mb-2`}>
                        日主五行: {jobRecommendation.selfElement}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {jobRecommendation.selfElementDescription}
                      </div>
                    </div>

                    {/* 推荐行业领域 */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className={`w-5 h-5 ${jobRecommendation.elementColors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-gray-800">推荐行业领域</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {jobRecommendation.industries.map((industry, index) => (
                          <button
                            key={index}
                            className={`${jobRecommendation.elementColors.bgButton} ${jobRecommendation.elementColors.hover} rounded-lg px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition-all`}
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 推荐职位类型 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-gray-800">推荐职位类型</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {jobRecommendation.positions.map((position, index) => (
                          <button
                            key={index}
                            className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition-all"
                          >
                            {position}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
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
