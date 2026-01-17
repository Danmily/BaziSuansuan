import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BaziResult } from '../utils/baziCalculator'
import { JobRecommendation } from '../utils/baziCalculator'
import { LifeKlineResult } from '../utils/lifeklineCalculator'
import { ELEMENT_MAP, ELEMENT_COLORS } from '../utils/baziCalculator'
import { getAIAnalysisWithRetry, getAIFashionRecommendation, getAIGodsRecommendation, getAILifeKlineAnalysis, getAIJobRecommendation, type FashionRecommendation } from '../utils/aiAnalysisService'
import { Briefcase, TrendingUp, Bot, FileText, Star, AlertTriangle, Info, Shirt, Key, MapPin } from 'lucide-react'
import LifeKlineChart from './LifeKlineChart'
import ElementRadarChart from './ElementRadarChart'
import ApiKeySettings from './ApiKeySettings'

interface BaziResultLayoutProps {
  baziResult: BaziResult
  jobRecommendation: JobRecommendation
  lifeKline: LifeKlineResult
  aiAnalysis: string | null
  isAnalyzing: boolean
  birthDateTime: string
  gender: '男' | '女'
  onRetryAIAnalysis?: () => void // 重新请求AI分析的回调
}

interface GodsRecommendation {
  favorableGods: string[]
  unfavorableGods: string[]
  advice?: string
}

type TabType = 'lifekline' | 'job' | 'ai' | 'bazi' | 'fashion'

export default function BaziResultLayout({
  baziResult,
  jobRecommendation,
  lifeKline,
  aiAnalysis,
  isAnalyzing,
  birthDateTime,
  gender,
  onRetryAIAnalysis
}: BaziResultLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lifekline')
  const [showApiKeySettings, setShowApiKeySettings] = useState(false)
  const [fashionRecommendation, setFashionRecommendation] = useState<FashionRecommendation | null>(null)
  const [isLoadingFashion, setIsLoadingFashion] = useState(false)
  const [godsRecommendation, setGodsRecommendation] = useState<GodsRecommendation | null>(null)
  const [isLoadingGods, setIsLoadingGods] = useState(false)
  const [lifeKlineAnalysis, setLifeKlineAnalysis] = useState<string | null>(null)
  const [isLoadingLifeKline, setIsLoadingLifeKline] = useState(false)
  const [showLifeKlineAnalysis, setShowLifeKlineAnalysis] = useState(false)
  const [aiJobRecommendation, setAiJobRecommendation] = useState<string | null>(null)
  const [isLoadingAiJob, setIsLoadingAiJob] = useState(false)
  const [showWaitingTip, setShowWaitingTip] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 计算当前年龄（基于2026年）
  const currentYear = 2026
  const birthYear = parseInt(birthDateTime.split('-')[0] || birthDateTime.split(' ')[0])
  const currentAge = Math.max(0, currentYear - birthYear)

  // 请求AI喜用神和忌神
  const fetchGodsRecommendation = async () => {
    showWaitingMessage()
    setIsLoadingGods(true)
    try {
      const [date, time] = birthDateTime.split(' ')
      const recommendation = await getAIGodsRecommendation({
        bazi: {
          year: `${baziResult.year.tianGan}${baziResult.year.diZhi}`,
          month: `${baziResult.month.tianGan}${baziResult.month.diZhi}`,
          day: `${baziResult.day.tianGan}${baziResult.day.diZhi}`,
          hour: `${baziResult.hour.tianGan}${baziResult.hour.diZhi}`
        },
        gender,
        birthDateTime,
        jobRecommendation: {
          selfElement: jobRecommendation.selfElement,
          bodyStrength: jobRecommendation.bodyStrength,
          scores: jobRecommendation.scores as unknown as Record<string, number>,
          industries: jobRecommendation.industries,
          positions: jobRecommendation.positions
        },
        lifeKline: {
          peakAge: lifeKline.peakAge,
          dayunInfo: {
            currentDayun: lifeKline.dayunInfo.currentDayun,
            luckTrend: lifeKline.dayunInfo.luckTrend,
            startAgeDetail: lifeKline.dayunInfo.startAgeDetail,
            direction: lifeKline.dayunInfo.direction,
            dayunList: lifeKline.dayunInfo.dayunList.map(d => ({
              tianGan: d.tianGan,
              diZhi: d.diZhi,
              startAge: d.startAge,
              endAge: d.endAge,
              ageRange: d.ageRange
            }))
          }
        }
      }) 
      setGodsRecommendation(recommendation)
    } catch (error: any) {
      console.error('AI喜用神分析失败:', error)
      setGodsRecommendation(null)
      const errorMsg = error?.message || 'AI分析失败，请检查API配置'
      showError(errorMsg)
    } finally {
      setIsLoadingGods(false)
    }
  }

  // 请求AI穿搭推荐
  const fetchFashionRecommendation = async () => {
    showWaitingMessage()
    setIsLoadingFashion(true)
    try {
      const [date, time] = birthDateTime.split(' ')
      const recommendation = await getAIFashionRecommendation({
        bazi: {
          year: `${baziResult.year.tianGan}${baziResult.year.diZhi}`,
          month: `${baziResult.month.tianGan}${baziResult.month.diZhi}`,
          day: `${baziResult.day.tianGan}${baziResult.day.diZhi}`,
          hour: `${baziResult.hour.tianGan}${baziResult.hour.diZhi}`
        },
        gender,
        birthDateTime,
        jobRecommendation: {
          selfElement: jobRecommendation.selfElement,
          bodyStrength: jobRecommendation.bodyStrength,
          scores: jobRecommendation.scores as unknown as Record<string, number>,
          industries: jobRecommendation.industries,
          positions: jobRecommendation.positions
        },
        lifeKline: {
          peakAge: lifeKline.peakAge,
          dayunInfo: {
            currentDayun: lifeKline.dayunInfo.currentDayun,
            luckTrend: lifeKline.dayunInfo.luckTrend,
            startAgeDetail: lifeKline.dayunInfo.startAgeDetail,
            direction: lifeKline.dayunInfo.direction,
            dayunList: lifeKline.dayunInfo.dayunList.map(d => ({
              tianGan: d.tianGan,
              diZhi: d.diZhi,
              startAge: d.startAge,
              endAge: d.endAge,
              ageRange: d.ageRange
            }))
          }
        }
      })
      setFashionRecommendation(recommendation)
    } catch (error: any) {
      console.error('AI穿搭推荐失败:', error)
      setFashionRecommendation(null)
      const errorMsg = error?.message || 'AI分析失败，请检查API配置'
      showError(errorMsg)
    } finally {
      setIsLoadingFashion(false)
    }
  }

  // 当切换到八字命盘标签时，如果没有喜用神数据则请求
  useEffect(() => {
    if (activeTab === 'bazi' && !godsRecommendation && !isLoadingGods) {
      const hasApiKey = () => {
        try {
          const stored = localStorage.getItem('bazi_ai_api_config')
          return stored !== null && stored !== 'null'
        } catch {
          return false
        }
      }
      
      if (hasApiKey()) {
        fetchGodsRecommendation()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // 当切换到穿搭推荐标签时，如果没有数据则请求
  useEffect(() => {
    if (activeTab === 'fashion' && !fashionRecommendation && !isLoadingFashion) {
      const hasApiKey = () => {
        try {
          const stored = localStorage.getItem('bazi_ai_api_config')
          return stored !== null && stored !== 'null'
        } catch {
          return false
        }
      }
      
      if (hasApiKey()) {
        fetchFashionRecommendation()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // 当AI分析完成后，自动请求喜用神
  useEffect(() => {
    if (aiAnalysis && !godsRecommendation && !isLoadingGods) {
      const hasApiKey = () => {
        try {
          const stored = localStorage.getItem('bazi_ai_api_config')
          return stored !== null && stored !== 'null'
        } catch {
          return false
        }
      }
      
      if (hasApiKey()) {
        fetchGodsRecommendation()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiAnalysis])

  // API Key保存成功后的回调
  const handleApiKeySaveSuccess = () => {
    // 重新请求AI分析
    if (onRetryAIAnalysis) {
      onRetryAIAnalysis()
    }
    // 如果当前在八字命盘标签，重新请求喜用神
    if (activeTab === 'bazi') {
      fetchGodsRecommendation()
    }
    // 如果当前在穿搭推荐标签，重新请求穿搭推荐
    if (activeTab === 'fashion') {
      fetchFashionRecommendation()
    }
  }

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

  // 显示等待提示
  const showWaitingMessage = () => {
    setShowWaitingTip(true)
    setTimeout(() => {
      setShowWaitingTip(false)
    }, 3000) // 3秒后自动消失
  }

  // 显示错误提示
  const showError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000) // 5秒后自动消失
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 等待提示 */}
      {showWaitingTip && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200/50 rounded-lg px-4 py-2 shadow-md flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">正在连接远程服务器，请耐心等待约10秒...</span>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-red-50/95 backdrop-blur-sm border border-red-200 rounded-lg px-4 py-3 shadow-lg flex items-start gap-3 max-w-md">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-800 mb-1">API连接失败</div>
              <div className="text-sm text-red-700">{errorMessage}</div>
              {errorMessage.includes('API密钥') && (
                <button
                  onClick={() => setShowApiKeySettings(true)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  前往设置API Key
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
      {/* 左侧固定栏 */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 mb-6">
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

        {/* 大运信息 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">大运信息</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">起运</div>
              <div className="text-sm font-semibold text-gray-800">{lifeKline.dayunInfo.startAgeDetail}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">方向</div>
              <div className="text-sm font-semibold text-gray-800">{lifeKline.dayunInfo.direction}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">当前</div>
              <div className="text-sm font-semibold text-gray-800">{lifeKline.dayunInfo.currentDayun}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">运势</div>
              <div className={`text-sm font-semibold ${
                lifeKline.dayunInfo.luckTrend === '上升' ? 'text-green-600' :
                lifeKline.dayunInfo.luckTrend === '下降' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {lifeKline.dayunInfo.luckTrend}
              </div>
            </div>
          </div>

          {/* 大运排盘 */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">大运排盘</div>
            <div className="grid grid-cols-5 gap-2">
              {lifeKline.dayunInfo.dayunList.slice(0, 10).map((dayun, index) => {
                // 判断当前年龄是否在此大运范围内
                const isCurrentAgeInDayun = currentAge >= dayun.startAge && currentAge <= dayun.endAge
                return (
                  <div
                    key={index}
                    className={`text-center p-2 rounded border-b-4 text-xs ${
                      isCurrentAgeInDayun
                        ? 'border-b-yellow-400 bg-yellow-50 border-l border-r border-t border-gray-200'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-gray-800">{dayun.tianGan}{dayun.diZhi}</div>
                    <div className="text-xs text-gray-500 mt-1">{dayun.ageRange}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部标签页 */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => setShowApiKeySettings(true)}
              className="px-4 py-2 mx-4 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all flex items-center gap-2"
              title="设置 API Key"
            >
              <Key className="w-4 h-4" />
              API设置
            </button>
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'lifekline' && (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">人生K线图</h3>
                  <button
                    onClick={async () => {
                      if (showLifeKlineAnalysis && lifeKlineAnalysis) {
                        setShowLifeKlineAnalysis(false)
                        return
                      }
                      showWaitingMessage()
                      setIsLoadingLifeKline(true)
                      try {
                      const analysis = await getAILifeKlineAnalysis({
                        bazi: {
                          year: `${baziResult.year.tianGan}${baziResult.year.diZhi}`,
                          month: `${baziResult.month.tianGan}${baziResult.month.diZhi}`,
                          day: `${baziResult.day.tianGan}${baziResult.day.diZhi}`,
                          hour: `${baziResult.hour.tianGan}${baziResult.hour.diZhi}`
                        },
                        gender,
                        birthDateTime,
                        jobRecommendation: {
                          selfElement: jobRecommendation.selfElement,
                          bodyStrength: jobRecommendation.bodyStrength,
                          scores: jobRecommendation.scores as unknown as Record<string, number>,
                          industries: jobRecommendation.industries,
                          positions: jobRecommendation.positions
                        },
                        lifeKline: {
                          peakAge: lifeKline.peakAge,
                          dayunInfo: {
                            currentDayun: lifeKline.dayunInfo.currentDayun,
                            luckTrend: lifeKline.dayunInfo.luckTrend,
                            startAgeDetail: lifeKline.dayunInfo.startAgeDetail,
                            direction: lifeKline.dayunInfo.direction,
                            dayunList: lifeKline.dayunInfo.dayunList.map(d => ({
                              tianGan: d.tianGan,
                              diZhi: d.diZhi,
                              startAge: d.startAge,
                              endAge: d.endAge,
                              ageRange: d.ageRange
                            }))
                          }
                        }
                      }, lifeKline)
                      setLifeKlineAnalysis(analysis)
                      setShowLifeKlineAnalysis(true)
                    } catch (error: any) {
                      console.error('AI人生K线分析失败:', error)
                      const errorMsg = error?.message || 'AI分析失败，请检查API配置'
                      showError(errorMsg)
                    } finally {
                      setIsLoadingLifeKline(false)
                    }
                  }}
                  disabled={isLoadingLifeKline}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  {isLoadingLifeKline ? '分析中...' : showLifeKlineAnalysis ? '隐藏AI分析' : 'AI修正分析'}
                </button>
              </div>
              
              {showLifeKlineAnalysis && lifeKlineAnalysis ? (
                <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-gray-700 prose-li:my-2 prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-semibold text-gray-800 mt-3 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-700 leading-relaxed" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline ? (
                            <code className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                          ) : (
                            <code className="block bg-gray-100 p-4 rounded-lg border border-gray-200 overflow-x-auto mb-4" {...props} />
                          ),
                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 overflow-x-auto mb-4" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-600 my-4 bg-orange-50 py-2 rounded-r" {...props} />
                        ),
                        hr: ({node, ...props}) => <hr className="my-6 border-gray-300" {...props} />,
                      }}
                    >
                      {lifeKlineAnalysis}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}
              
              <div className={showLifeKlineAnalysis ? "h-[500px]" : "flex-1"}>
                <LifeKlineChart data={lifeKline} />
              </div>
            </div>
          )}

          {activeTab === 'job' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className={`w-5 h-5 ${jobRecommendation.elementColors.text}`} />
                    <h3 className="text-xl font-bold text-gray-800">职业发展建议</h3>
                  </div>
                  <button
                    onClick={async () => {
                      showWaitingMessage()
                      setIsLoadingAiJob(true)
                      try {
                        const analysis = await getAIJobRecommendation({
                          bazi: {
                            year: `${baziResult.year.tianGan}${baziResult.year.diZhi}`,
                            month: `${baziResult.month.tianGan}${baziResult.month.diZhi}`,
                            day: `${baziResult.day.tianGan}${baziResult.day.diZhi}`,
                            hour: `${baziResult.hour.tianGan}${baziResult.hour.diZhi}`
                          },
                          gender,
                          birthDateTime,
                          jobRecommendation: {
                            selfElement: jobRecommendation.selfElement,
                            bodyStrength: jobRecommendation.bodyStrength,
                            scores: jobRecommendation.scores as unknown as Record<string, number>,
                            industries: jobRecommendation.industries,
                            positions: jobRecommendation.positions
                          },
                          lifeKline: {
                            peakAge: lifeKline.peakAge,
                            dayunInfo: {
                              currentDayun: lifeKline.dayunInfo.currentDayun,
                              luckTrend: lifeKline.dayunInfo.luckTrend,
                              startAgeDetail: lifeKline.dayunInfo.startAgeDetail,
                              direction: lifeKline.dayunInfo.direction,
                              dayunList: lifeKline.dayunInfo.dayunList.map(d => ({
                                tianGan: d.tianGan,
                                diZhi: d.diZhi,
                                startAge: d.startAge,
                                endAge: d.endAge,
                                ageRange: d.ageRange
                              }))
                            }
                          }
                        })
                        setAiJobRecommendation(analysis)
                      } catch (error: any) {
                        console.error('AI推荐岗位失败:', error)
                        const errorMsg = error?.message || 'AI分析失败，请检查API配置'
                        showError(errorMsg)
                      } finally {
                        setIsLoadingAiJob(false)
                      }
                    }}
                    disabled={isLoadingAiJob}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    {isLoadingAiJob ? '分析中...' : 'AI推荐岗位'}
                  </button>
                </div>

                {/* AI推荐岗位 */}
                {aiJobRecommendation && (
                  <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-800">AI推荐岗位</h4>
                    </div>
                    <div className="prose prose-sm max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-6 prose-li:text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiJobRecommendation}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

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

                {/* 小麦招聘广告 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                          <span className="font-semibold text-blue-700">想要找到合适的AI工作</span>，想要<span className="font-semibold text-blue-700">跨行入门AI</span>，想要<span className="font-semibold text-blue-700">修改简历模拟面试</span>，都可以上
                          <a 
                            href="https://lovtalent.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold underline mx-1"
                          >
                            小麦招聘
                          </a>
                          来找寻您心仪的工作
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500 text-center px-2">小程序<br />二维码<br />（审核中）</span>
                        </div>
                      </div>
                    </div>
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
              
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">AI正在分析中，请稍候...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-gray-700 prose-li:my-2 prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b border-gray-200" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-semibold text-gray-800 mt-3 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-700 leading-relaxed" {...props} />,
                        code: ({node, inline, ...props}: any) => 
                          inline ? (
                            <code className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                          ) : (
                            <code className="block bg-gray-100 p-4 rounded-lg border border-gray-200 overflow-x-auto mb-4" {...props} />
                          ),
                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 overflow-x-auto mb-4" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-600 my-4 bg-orange-50 py-2 rounded-r" {...props} />
                        ),
                        hr: ({node, ...props}) => <hr className="my-6 border-gray-300" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-gray-300" {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => (
                          <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" {...props} />
                        ),
                        td: ({node, ...props}) => (
                          <td className="border border-gray-300 px-4 py-2" {...props} />
                        ),
                      }}
                    >
                      {aiAnalysis}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⚠️ AI分析功能需要配置API密钥。请在环境变量中设置：
                    </p>
                    <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside space-y-1">
                      <li><code>VITE_AI_API_KEY</code> - API密钥</li>
                      <li><code>VITE_AI_PROVIDER</code> - 提供商（deepseek 或 openai）</li>
                      <li><code>VITE_AI_BASE_URL</code> - 自定义API地址（可选）</li>
                    </ul>
                  </div>
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
              )}
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
                    {isLoadingGods && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 ml-auto"></div>
                    )}
                  </div>
                  {isLoadingGods ? (
                    <div className="text-center py-4 text-sm text-gray-500">AI分析中...</div>
                  ) : godsRecommendation ? (
                    <>
                      <div className="space-y-2 mb-3">
                        {godsRecommendation.favorableGods.map((god, index) => (
                          <div
                            key={index}
                            className="border-2 border-green-500 rounded-lg px-3 py-2 text-center text-sm text-gray-700 font-medium bg-green-50"
                          >
                            {god}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">多接触可提升运势</p>
                    </>
                  ) : (
                    <>
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
                      <button
                        onClick={fetchGodsRecommendation}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        使用AI重新分析
                      </button>
                    </>
                  )}
                </div>

                {/* 忌神 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="text-base font-bold text-gray-800">忌神</h4>
                  </div>
                  {isLoadingGods ? (
                    <div className="text-center py-4 text-sm text-gray-500">AI分析中...</div>
                  ) : godsRecommendation ? (
                    <>
                      <div className="space-y-2 mb-3">
                        {godsRecommendation.unfavorableGods.map((god, index) => (
                          <div
                            key={index}
                            className="border-2 border-red-500 rounded-lg px-3 py-2 text-center text-sm text-gray-700 font-medium bg-red-50"
                          >
                            {god}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">需要注意规避</p>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* 命格建议 */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h4 className="text-base font-bold text-gray-800">命格建议</h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {godsRecommendation?.advice || jobRecommendation.mingGe.advice}
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
              
              {isLoadingFashion ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">AI正在生成穿搭推荐，请稍候...</p>
                </div>
              ) : fashionRecommendation ? (
                <div className="space-y-6">
                  {/* 风格标题 */}
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      OOTD·{fashionRecommendation.style}
                    </h4>
                  </div>

                  {/* 颜色推荐 */}
                  {fashionRecommendation.colors.length > 0 && (
                    <div className="mb-8">
                      <h5 className="text-lg font-semibold text-gray-800 mb-6">推荐颜色</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {fashionRecommendation.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex flex-col gap-4"
                          >
                            {/* 颜色块 */}
                            <div
                              className="w-full aspect-square rounded-lg shadow-lg border-2 border-gray-300 hover:scale-105 transition-transform"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            {/* 颜色信息 */}
                            <div className="text-center">
                              <div className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">{color.name}</div>
                              {color.description && (
                                <div className="text-xs text-gray-700 leading-relaxed px-2">
                                  {color.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 单品建议 */}
                  {fashionRecommendation.items.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-4">单品建议</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {fashionRecommendation.items.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-all"
                          >
                            <div className="text-sm font-medium text-gray-800">{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 桃花邂逅地 */}
                  {fashionRecommendation.locations.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        桃花邂逅地
                      </h5>
                      <div className="space-y-4">
                        {fashionRecommendation.locations.map((location, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200"
                          >
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 mb-1">
                                  {location.name} ({location.direction})
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  {location.reason}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 重新生成按钮 */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={fetchFashionRecommendation}
                      disabled={isLoadingFashion}
                      className="w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoadingFashion ? '生成中...' : '重新生成推荐'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-gray-700">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⚠️ AI穿搭推荐功能需要配置API密钥。请点击右上角"API设置"按钮进行配置。
                    </p>
                  </div>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* API Key 设置 */}
      {showApiKeySettings && (
        <ApiKeySettings 
          onClose={() => setShowApiKeySettings(false)}
          onSaveSuccess={handleApiKeySaveSuccess}
        />
      )}
    </div>
  )
}
