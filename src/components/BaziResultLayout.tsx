import { useState } from 'react'
import { BaziResult } from '../utils/baziCalculator'
import { JobRecommendation } from '../utils/baziCalculator'
import { LifeKlineResult } from '../utils/lifeklineCalculator'
import { ELEMENT_MAP, ELEMENT_COLORS } from '../utils/baziCalculator'
import { Briefcase, TrendingUp, Bot, FileText, Star, AlertTriangle, Info, Shirt } from 'lucide-react'
import LifeKlineChart from './LifeKlineChart'
import ElementRadarChart from './ElementRadarChart'

interface BaziResultLayoutProps {
  baziResult: BaziResult
  jobRecommendation: JobRecommendation
  lifeKline: LifeKlineResult
  birthDateTime: string
  gender: '男' | '女'
}

type TabType = 'lifekline' | 'job' | 'ai' | 'bazi' | 'fashion'

export default function BaziResultLayout({
  baziResult,
  jobRecommendation,
  lifeKline,
  birthDateTime,
  gender
}: BaziResultLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lifekline')

  // 获取天干地支对应的颜色类名
  const getElementColor = (ganZhi: string): string => {
    const element = ELEMENT_MAP[ganZhi]
    if (!element) return 'text-gray-600'
    return ELEMENT_COLORS[element].textDark
  }

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return ''
    const [date, time] = dateTime.split(' ')
    if (!date || !time) return ''
    const [year, month, day] = date.split('-')
    const [hour, minute] = time.split(':')
    return `${year}/${month}/${day} ${hour}:${minute}`
  }

  const tabs = [
    { id: 'lifekline' as TabType, label: '人生K线', icon: TrendingUp },
    { id: 'job' as TabType, label: '职位推荐', icon: Briefcase },
    { id: 'ai' as TabType, label: 'AI分析', icon: Bot },
    { id: 'bazi' as TabType, label: '八字命盘', icon: FileText },
    { id: 'fashion' as TabType, label: '穿搭推荐', icon: Shirt }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧固定栏 */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto sticky top-0 h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">八字信息</h2>
        
        {/* 基本信息 */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">性别</div>
          <div className="text-lg font-semibold text-gray-800">{gender}</div>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">出生时间</div>
          <div className="text-lg font-semibold text-gray-800">{formatDateTime(birthDateTime)}</div>
        </div>

        {/* 八字四柱 */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-3">四柱</div>
          <div className="grid grid-cols-2 gap-3">
            {/* 年柱 */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">年柱</div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 shadow-sm">
                <div className={`text-xl font-bold mb-1 ${getElementColor(baziResult.year.tianGan)}`}>
                  {baziResult.year.tianGan}
                </div>
                <div className={`text-xl font-bold ${getElementColor(baziResult.year.diZhi)}`}>
                  {baziResult.year.diZhi}
                </div>
              </div>
            </div>

            {/* 月柱 */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">月柱</div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 shadow-sm">
                <div className={`text-xl font-bold mb-1 ${getElementColor(baziResult.month.tianGan)}`}>
                  {baziResult.month.tianGan}
                </div>
                <div className={`text-xl font-bold ${getElementColor(baziResult.month.diZhi)}`}>
                  {baziResult.month.diZhi}
                </div>
              </div>
            </div>

            {/* 日柱 */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">日柱</div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 shadow-sm">
                <div className={`text-xl font-bold mb-1 ${getElementColor(baziResult.day.tianGan)}`}>
                  {baziResult.day.tianGan}
                </div>
                <div className={`text-xl font-bold ${getElementColor(baziResult.day.diZhi)}`}>
                  {baziResult.day.diZhi}
                </div>
              </div>
            </div>

            {/* 时柱 */}
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">时柱</div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 shadow-sm">
                <div className={`text-xl font-bold mb-1 ${getElementColor(baziResult.hour.tianGan)}`}>
                  {baziResult.hour.tianGan}
                </div>
                <div className={`text-xl font-bold ${getElementColor(baziResult.hour.diZhi)}`}>
                  {baziResult.hour.diZhi}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 完整八字 */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">完整八字</div>
          <div className="text-lg font-bold">
            <span className={getElementColor(baziResult.year.tianGan)}>{baziResult.year.tianGan}</span>
            <span className={getElementColor(baziResult.year.diZhi)}>{baziResult.year.diZhi}</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className={getElementColor(baziResult.month.tianGan)}>{baziResult.month.tianGan}</span>
            <span className={getElementColor(baziResult.month.diZhi)}>{baziResult.month.diZhi}</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className={getElementColor(baziResult.day.tianGan)}>{baziResult.day.tianGan}</span>
            <span className={getElementColor(baziResult.day.diZhi)}>{baziResult.day.diZhi}</span>
            <span className="text-gray-400 mx-1">·</span>
            <span className={getElementColor(baziResult.hour.tianGan)}>{baziResult.hour.tianGan}</span>
            <span className={getElementColor(baziResult.hour.diZhi)}>{baziResult.hour.diZhi}</span>
          </div>
        </div>

        {/* 身强身弱 */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-2">日主五行</div>
          <div className={`text-2xl font-bold ${jobRecommendation.elementColors.textDark} mb-2`}>
            {jobRecommendation.selfElement}
          </div>
          <div className="text-sm text-gray-700 mb-3">{jobRecommendation.selfElementDescription}</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">身强身弱</span>
            <span className={`font-bold ${jobRecommendation.bodyStrength === '身强' ? 'text-red-600' : 'text-blue-600'}`}>
              {jobRecommendation.bodyStrength}
            </span>
          </div>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部标签页 */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'lifekline' && (
            <div className="h-full">
              <LifeKlineChart data={lifeKline} />
            </div>
          )}

          {activeTab === 'job' && (
            <div className="max-w-4xl mx-auto">
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
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">AI智能分析</h3>
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  {jobRecommendation.suggestion}
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-2">综合分析</h4>
                  <p className="text-sm leading-relaxed">
                    根据您的八字分析，您在人生不同阶段会有不同的机遇和挑战。建议在运势旺盛期（{lifeKline.peakAge ? `${lifeKline.peakAge.start}-${lifeKline.peakAge.end}岁` : '约30-40岁'}）积极把握机会，在低谷期保持耐心和积累。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bazi' && (
            <div className="max-w-6xl mx-auto bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              {/* 日主信息和五行能量图 - 并排显示 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* 左侧：日主信息 */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">日主</h2>
                    <div className={`text-6xl font-bold ${jobRecommendation.elementColors.textDark} mb-3`}>
                      {baziResult.day.tianGan}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {jobRecommendation.mingGe.description}
                    </div>
                  </div>
                  
                  {/* 命格名称 */}
                  <div className={`border-2 ${jobRecommendation.elementColors.border} rounded-lg p-3 bg-white`}>
                    <div className={`text-xl font-bold text-center ${jobRecommendation.elementColors.textDark}`}>
                      {jobRecommendation.mingGe.name}
                    </div>
                    <div className="text-sm text-gray-600 text-center mt-2">
                      {jobRecommendation.selfElement === '金' && '果断刚毅,重情重义,有侠客风范'}
                      {jobRecommendation.selfElement === '火' && '热情活跃,果断刚毅,具有领袖气质'}
                      {jobRecommendation.selfElement === '木' && '仁慈温和,有创造力,具有人文关怀'}
                      {jobRecommendation.selfElement === '土' && '稳重踏实,包容大度,具有责任心'}
                      {jobRecommendation.selfElement === '水' && '智慧灵活,适应力强,具有变通性'}
                    </div>
                  </div>
                </div>

                {/* 右侧：五行能量分布图 */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">五行能量分布</h3>
                  <div className="h-64">
                    <ElementRadarChart scores={jobRecommendation.scores} />
                  </div>
                  
                  {/* 五行图例 */}
                  <div className="flex justify-center gap-4 mt-4">
                    {(['木', '火', '土', '金', '水'] as const).map((element) => {
                      const colorMap: Record<string, string> = {
                        '木': '#10b981',
                        '火': '#ef4444',
                        '土': '#f59e0b',
                        '金': '#eab308',
                        '水': '#3b82f6'
                      }
                      const score = jobRecommendation.scores[element]
                      return (
                        <div key={element} className="flex flex-col items-center gap-1">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: colorMap[element] }}
                          ></div>
                          <span className="text-xs text-gray-600">{element}</span>
                          <span className="text-xs font-bold text-gray-800">{score}分</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 底部三列 */}
              <div className="grid grid-cols-3 gap-4">
                {/* 喜用神 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-green-600" />
                    <h4 className="text-base font-bold text-gray-800">喜用神</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    {jobRecommendation.mingGe.favorableGods.map((god, index) => (
                      <div
                        key={index}
                        className="border-2 border-green-500 rounded-lg px-3 py-2 text-center text-sm text-gray-700 font-medium bg-green-50"
                      >
                        {god}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">多接触可提升运势</p>
                </div>

                {/* 忌神 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="text-base font-bold text-gray-800">忌神</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    {jobRecommendation.mingGe.unfavorableGods.map((god, index) => (
                      <div
                        key={index}
                        className="border-2 border-red-500 rounded-lg px-3 py-2 text-center text-sm text-gray-700 font-medium bg-red-50"
                      >
                        {god}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">需要注意规避</p>
                </div>

                {/* 命格建议 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h4 className="text-base font-bold text-gray-800">命格建议</h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {jobRecommendation.mingGe.advice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fashion' && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Shirt className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800">穿搭推荐</h3>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div className={`${jobRecommendation.elementColors.bgLight} rounded-lg p-4 border ${jobRecommendation.elementColors.border}`}>
                  <h4 className={`font-semibold ${jobRecommendation.elementColors.textDark} mb-2`}>
                    根据您的日主五行（{jobRecommendation.selfElement}）推荐
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {jobRecommendation.selfElement === '金' && '适合金色、白色、银色系服装，体现刚毅果断的气质。推荐金属配饰、简约干练的款式。'}
                    {jobRecommendation.selfElement === '火' && '适合红色、橙色、粉色系服装，展现热情活力的个性。推荐亮色系、时尚前卫的款式。'}
                    {jobRecommendation.selfElement === '木' && '适合绿色、青色、浅色系服装，体现自然清新的风格。推荐舒适休闲、文艺清新的款式。'}
                    {jobRecommendation.selfElement === '土' && '适合棕色、黄色、米色系服装，展现稳重踏实的特质。推荐经典款式、大地色系的搭配。'}
                    {jobRecommendation.selfElement === '水' && '适合蓝色、黑色、深色系服装，体现智慧灵活的气质。推荐优雅知性、简约大方的款式。'}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-2">穿搭建议</h4>
                  <p className="text-sm leading-relaxed">
                    根据您的命格特点，建议在重要场合选择与五行相配的颜色，有助于提升运势和自信心。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
