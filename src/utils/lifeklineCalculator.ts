import { BaziResult, ELEMENT_MAP, calculateFiveElementsScore } from './baziCalculator'
import { Lunar, Solar } from 'lunar-typescript'

// 天干地支数组
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 六十甲子数组（用于大运计算）
function generateJiaZi(): string[] {
  const jiaZi: string[] = []
  for (let i = 0; i < 60; i++) {
    const tianGanIndex = i % 10
    const diZhiIndex = i % 12
    jiaZi.push(TIAN_GAN[tianGanIndex] + DI_ZHI[diZhiIndex])
  }
  return jiaZi
}

const JIA_ZI = generateJiaZi()

// 大运信息接口
export interface DayunInfo {
  tianGan: string
  diZhi: string
  startAge: number
  endAge: number
  ageRange: string
}

export interface LifeKlineData {
  age: number
  year: number
  score: number // 运势得分 (0-100)
  trend: 'up' | 'down' // 上行/下行
  description: string
  dayun?: { tianGan: string; diZhi: string } // 当前大运
}

export interface LifeKlineResult {
  data: LifeKlineData[]
  peakAge: { start: number; end: number } | null // 人生巅峰年龄
  currentScore: number // 当前运势得分
  dayunInfo: {
    startAge: number // 起运年龄（岁）
    startAgeDetail: string // 起运年龄详细（如：3岁4个月）
    direction: '顺排' | '逆排' // 大运方向
    currentDayun: string // 当前大运
    luckTrend: string // 运势趋势
    dayunList: DayunInfo[] // 大运列表
  }
}

/**
 * 计算起运年龄
 * 3天=1岁，1天=4个月，1时辰=10天
 */
function calculateStartAge(
  birthSolar: Solar,
  isForward: boolean
): { age: number; detail: string } {
  try {
    const birthLunar = birthSolar.getLunar()
    
    // 获取节气表
    const jieQiTable = birthLunar.getJieQiTable()
    // 手动构造 Date 对象：lunar-typescript 的 Solar 对象没有直接的 toDate() 方法
    const birthDate = new Date(
      birthSolar.getYear(),
      birthSolar.getMonth() - 1, // JavaScript 月份从 0 开始
      birthSolar.getDay(),
      birthSolar.getHour(),
      birthSolar.getMinute(),
      birthSolar.getSecond()
    )
    
    // 找到下一个或上一个节气
    let targetSolar: Solar | null = null
    
    if (isForward) {
      // 顺排：数到下一个节气
      // 遍历节气表找到出生日之后最近的节气
      const jieQiNames = Object.keys(jieQiTable)
      for (const name of jieQiNames) {
        const jieQiSolar = jieQiTable[name]
        if (jieQiSolar) {
          const jieQiDate = new Date(
            jieQiSolar.getYear(),
            jieQiSolar.getMonth() - 1,
            jieQiSolar.getDay(),
            jieQiSolar.getHour(),
            jieQiSolar.getMinute(),
            jieQiSolar.getSecond()
          )
          if (jieQiDate.getTime() > birthDate.getTime()) {
            targetSolar = jieQiSolar
            break
          }
        }
      }
      // 如果没找到，查找下一年
      if (!targetSolar) {
        const nextYear = Solar.fromYmd(birthSolar.getYear() + 1, 1, 1)
        const nextYearJieQiTable = nextYear.getLunar().getJieQiTable()
        const firstJieQiName = Object.keys(nextYearJieQiTable)[0]
        targetSolar = nextYearJieQiTable[firstJieQiName]
      }
    } else {
      // 逆排：数到上一个节气
      // 遍历节气表找到出生日之前最近的节气
      const jieQiNames = Object.keys(jieQiTable).reverse()
      for (const name of jieQiNames) {
        const jieQiSolar = jieQiTable[name]
        if (jieQiSolar) {
          const jieQiDate = new Date(
            jieQiSolar.getYear(),
            jieQiSolar.getMonth() - 1,
            jieQiSolar.getDay(),
            jieQiSolar.getHour(),
            jieQiSolar.getMinute(),
            jieQiSolar.getSecond()
          )
          if (jieQiDate.getTime() < birthDate.getTime()) {
            targetSolar = jieQiSolar
            break
          }
        }
      }
      // 如果没找到，查找上一年
      if (!targetSolar) {
        const prevYear = Solar.fromYmd(birthSolar.getYear() - 1, 12, 31)
        const prevYearJieQiTable = prevYear.getLunar().getJieQiTable()
        const jieQiNames = Object.keys(prevYearJieQiTable).reverse()
        targetSolar = prevYearJieQiTable[jieQiNames[0]]
      }
    }
    
    if (!targetSolar) {
      // 如果还是找不到，使用简化算法：默认4岁起运
      return { age: 4, detail: '4岁' }
    }
    
    // 计算时间差（毫秒）
    const targetDate = new Date(
      targetSolar.getYear(),
      targetSolar.getMonth() - 1,
      targetSolar.getDay(),
      targetSolar.getHour(),
      targetSolar.getMinute(),
      targetSolar.getSecond()
    )
    const diffMs = Math.abs(targetDate.getTime() - birthDate.getTime())
    
    // 转换为天数（包含小时）
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    
    // 计算起运年龄
    // 3天=1岁，1天=4个月，1时辰=10天
    const years = Math.floor(diffDays / 3)
    const remainingDays = diffDays % 3
    const months = Math.floor(remainingDays * 4)
    
    // 至少1岁起运
    const finalYears = Math.max(1, years)
    const finalMonths = months
    
    let detail = `${finalYears}岁`
    if (finalMonths > 0) {
      detail = `${finalYears}岁${finalMonths}个月`
    }
    
    // 如果是逆排且年龄小于1岁，至少返回1岁
    return { 
      age: Math.max(1, finalYears), 
      detail: finalMonths > 0 && finalYears >= 1 ? detail : `${Math.max(1, finalYears)}岁`
    }
  } catch (error) {
    console.error('计算起运年龄失败:', error)
    // 默认4岁起运
    return { age: 4, detail: '4岁' }
  }
}

/**
 * 计算大运干支序列
 * 从月柱按六十甲子顺序顺排或逆排，每10年一柱
 */
function calculateDayunSequence(
  monthGanZhi: string,
  isForward: boolean,
  count: number = 10
): DayunInfo[] {
  const monthIndex = JIA_ZI.indexOf(monthGanZhi)
  if (monthIndex === -1) {
    return []
  }
  
  const dayunList: DayunInfo[] = []
  
  for (let i = 0; i < count; i++) {
    let index: number
    if (isForward) {
      // 顺排：往后推
      index = (monthIndex + i + 1) % 60
    } else {
      // 逆排：往前推
      index = (monthIndex - i - 1 + 60) % 60
    }
    
    const ganZhi = JIA_ZI[index]
    const startAge = i * 10
    const endAge = (i + 1) * 10 - 1
    const ageRange = `${startAge}-${endAge}岁`
    
    dayunList.push({
      tianGan: ganZhi[0],
      diZhi: ganZhi[1],
      startAge,
      endAge,
      ageRange
    })
  }
  
  return dayunList
}

/**
 * 根据年干判断阴阳
 * 阳年：甲、丙、戊、庚、壬（索引0,2,4,6,8）
 * 阴年：乙、丁、己、辛、癸（索引1,3,5,7,9）
 */
function isYangYear(yearGan: string): boolean {
  const index = TIAN_GAN.indexOf(yearGan)
  return index !== -1 && index % 2 === 0
}

/**
 * 计算人生K线数据
 * 根据八字大运和流年推算各个年龄段的运势
 */
export function calculateLifeKline(
  bazi: BaziResult,
  birthDate: string,
  birthTime: string,
  gender: '男' | '女'
): LifeKlineResult {
  try {
    const [year, month, day] = birthDate.split('-').map(Number)
    const [hour, minute] = birthTime.split(':').map(Number)
    
    const birthSolar = Solar.fromYmdHms(year, month, day, hour, minute || 0, 0)
    const birthLunar = birthSolar.getLunar()
    
    // 判断年干阴阳
    const yearGan = bazi.year.tianGan
    const isYang = isYangYear(yearGan)
    
    // 判断大运方向：阳男阴女顺排，阴男阳女逆排
    const isForward = (isYang && gender === '男') || (!isYang && gender === '女')
    const direction: '顺排' | '逆排' = isForward ? '顺排' : '逆排'
    
    // 计算起运年龄
    const startAgeInfo = calculateStartAge(birthSolar, isForward)
    
    // 获取月柱干支
    const monthGanZhi = bazi.month.tianGan + bazi.month.diZhi
    
    // 计算大运序列（10个，每10年一柱）
    const dayunList = calculateDayunSequence(monthGanZhi, isForward, 10)
    
    // 调整大运的起运年龄（加上起运年龄偏移）
    // 第一个大运从起运年龄开始，每10年一个周期
    dayunList.forEach((dayun, index) => {
      dayun.startAge = startAgeInfo.age + index * 10
      dayun.endAge = startAgeInfo.age + (index + 1) * 10 - 1
      dayun.ageRange = `${dayun.startAge}-${dayun.endAge}岁`
    })
    
    // 计算当前年龄（基于2026年）
    const currentYear = 2026
    const currentAge = Math.max(0, currentYear - year)
    const currentDayun = dayunList.find(
      d => currentAge >= d.startAge && currentAge <= d.endAge
    ) || dayunList[0]
    
    // 判断当前大运的运势趋势（简化算法）
    const dayunElement = ELEMENT_MAP[currentDayun.diZhi]
    const dayElement = ELEMENT_MAP[bazi.day.tianGan]
    const effect = getElementEffect(dayElement, dayunElement)
    const luckTrend = effect > 0 ? '上升' : effect < -0.3 ? '下降' : '平稳'
    
    const baseScores = calculateFiveElementsScore(bazi)
    const data: LifeKlineData[] = []
    let maxScore = 0
    let peakAgeStart = 0
    let peakAgeEnd = 0
    let inPeakZone = false
    
    // 计算每岁的运势得分
    for (let age = 0; age <= 100; age += 1) {
      const currentYear = year + age
      
      // 获取当前年龄对应的大运
      // 年龄小于起运年龄时，使用第一个大运
      let ageDayun: DayunInfo
      if (age < startAgeInfo.age) {
        ageDayun = dayunList[0]
      } else {
        // 找到年龄所属的大运区间
        ageDayun = dayunList.find(
          d => age >= d.startAge && age <= d.endAge
        ) || dayunList[0]
      }
      
      // 计算流年干支
      const lunar = Solar.fromYmd(currentYear, 1, 1).getLunar()
      const liuNianGZ = lunar.getYearInGanZhi()
      
      // 计算运势得分：基于五行相生相克关系
      const dayElement = ELEMENT_MAP[bazi.day.tianGan]
      const daYunElement = ELEMENT_MAP[ageDayun.diZhi]
      const liuNianElement = ELEMENT_MAP[liuNianGZ[1]] // 流年地支五行
      
      let score = baseScores[dayElement]
      
      // 大运五行对日主的影响
      const daYunEffect = getElementEffect(dayElement, daYunElement)
      score += daYunEffect * 15 // 大运权重
      
      // 流年五行对日主的影响
      const liuNianEffect = getElementEffect(dayElement, liuNianElement)
      score += liuNianEffect * 10 // 流年权重
      
      // 添加年龄周期波动（模拟人生起伏）
      const cycleFactor = Math.sin((age / 100) * Math.PI * 4) * 20
      score += cycleFactor
      
      // 添加随机波动（增加真实性）
      const randomFactor = (Math.sin(age * 0.5) + Math.cos(age * 0.3)) * 5
      score += randomFactor
      
      // 限制得分范围在 0-100
      score = Math.max(0, Math.min(100, score))
      
      // 判断趋势
      const prevScore = age > 0 ? data[age - 1]?.score || 50 : 50
      const trend: 'up' | 'down' = score >= prevScore ? 'up' : 'down'
      
      // 记录巅峰期（得分>80的连续年龄区间）
      if (score > 80) {
        if (!inPeakZone) {
          peakAgeStart = age
          inPeakZone = true
        }
        peakAgeEnd = age
        if (score > maxScore) {
          maxScore = score
        }
      } else {
        inPeakZone = false
      }
      
      // 生成描述
      let description = ''
      if (score > 80) {
        description = '人生巅峰期，事业顺利，机遇多多'
      } else if (score > 60) {
        description = '运势良好，稳步上升'
      } else if (score > 40) {
        description = '运势平稳，稳中求进'
      } else if (score > 20) {
        description = '运势低迷，需谨慎应对'
      } else {
        description = '人生低谷，韬光养晦'
      }
      
      data.push({
        age,
        year: currentYear,
        score: Math.round(score),
        trend,
        description,
        dayun: { tianGan: ageDayun.tianGan, diZhi: ageDayun.diZhi }
      })
    }
    
    return {
      data,
      peakAge: maxScore > 80 ? { start: peakAgeStart, end: peakAgeEnd } : null,
      currentScore: data[Math.min(30, data.length - 1)]?.score || 50,
      dayunInfo: {
        startAge: startAgeInfo.age,
        startAgeDetail: startAgeInfo.detail,
        direction,
        currentDayun: currentDayun.tianGan + currentDayun.diZhi,
        luckTrend,
        dayunList
      }
    }
  } catch (error) {
    console.error('人生K线计算失败:', error)
    // 返回默认值
    return {
      data: [],
      peakAge: null,
      currentScore: 50,
      dayunInfo: {
        startAge: 0,
        startAgeDetail: '0岁',
        direction: '顺排',
        currentDayun: '',
        luckTrend: '平稳',
        dayunList: []
      }
    }
  }
}

/**
 * 五行相生相克关系
 * 返回对日主的增益系数（-1到1之间）
 */
function getElementEffect(selfElement: string, otherElement: string): number {
  // 相生关系：木生火，火生土，土生金，金生水，水生木
  // 相克关系：木克土，土克水，水克火，火克金，金克木
  
  const elementOrder = ['木', '火', '土', '金', '水']
  const selfIndex = elementOrder.indexOf(selfElement)
  const otherIndex = elementOrder.indexOf(otherElement)
  
  if (selfIndex === -1 || otherIndex === -1) return 0
  
  // 相同五行
  if (selfIndex === otherIndex) return 0.5
  
  // 相生：下一位生上一位
  if ((otherIndex + 1) % 5 === selfIndex) {
    return 0.8 // 被生，增益大
  }
  
  // 生我者
  if ((selfIndex + 1) % 5 === otherIndex) {
    return 0.3 // 我生，消耗
  }
  
  // 相克：隔一位克
  if ((selfIndex + 2) % 5 === otherIndex) {
    return -0.6 // 被克，减益
  }
  
  // 我克
  if ((otherIndex + 2) % 5 === selfIndex) {
    return 0.1 // 克他，小增益
  }
  
  return 0
}
