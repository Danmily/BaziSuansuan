import { BaziResult, ELEMENT_MAP, calculateFiveElementsScore } from './baziCalculator'
import { Lunar, Solar } from 'lunar-typescript'

// 大运计算：根据出生年、月、日计算起运时间
// 阳年男命/阴年女命顺行，阴年男命/阳年女命逆行
export interface LifeKlineData {
  age: number
  year: number
  score: number // 运势得分 (0-100)
  trend: 'up' | 'down' // 上行/下行
  description: string
}

export interface LifeKlineResult {
  data: LifeKlineData[]
  peakAge: { start: number; end: number } | null // 人生巅峰年龄
  currentScore: number // 当前运势得分
}

/**
 * 计算人生K线数据
 * 根据八字大运和流年推算各个年龄段的运势
 */
export function calculateLifeKline(
  bazi: BaziResult,
  birthYear: number,
  gender: '男' | '女'
): LifeKlineResult {
  const baseScores = calculateFiveElementsScore(bazi)
  const dayGan = bazi.day.tianGan
  const dayGanIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(dayGan)
  
  // 判断阳年阴年：甲、丙、戊、庚、壬为阳年
  const isYangYear = dayGanIndex % 2 === 0
  // 判断男女：阳年男命/阴年女命顺行，阴年男命/阳年女命逆行
  const isForward = (isYangYear && gender === '男') || (!isYangYear && gender === '女')
  
  const data: LifeKlineData[] = []
  let maxScore = 0
  let peakAgeStart = 0
  let peakAgeEnd = 0
  let inPeakZone = false
  
  const DI_ZHI_ARR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const TIAN_GAN_ARR = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  
  // 从出生年开始，计算每10年一个大运周期的运势
  // 简化计算：每10年为一个周期，每个周期内逐年计算
  for (let age = 0; age <= 100; age += 1) {
    const year = birthYear + age
    
    // 计算大运干支（每10年一换）
    const daYunIndex = Math.floor(age / 10)
    const monthDiZhi = bazi.month.diZhi
    const monthDiZhiIndex = DI_ZHI_ARR.indexOf(monthDiZhi)
    
    // 大运地支：顺行或逆行
    let daYunDiZhiIndex: number
    if (isForward) {
      daYunDiZhiIndex = (monthDiZhiIndex + daYunIndex + 1) % 12
    } else {
      daYunDiZhiIndex = (monthDiZhiIndex - daYunIndex - 1 + 12) % 12
    }
    
    const daYunDiZhi = DI_ZHI_ARR[daYunDiZhiIndex]
    
    // 大运天干：根据大运地支推算（简化算法）
    const daYunTianGanIndex = (dayGanIndex + daYunIndex) % 10
    const daYunTianGan = TIAN_GAN_ARR[daYunTianGanIndex]
    
    // 计算流年干支
    const lunar = Solar.fromYmd(year, 1, 1, 0, 0, 0).getLunar()
    const liuNianGZ = lunar.getYearInGanZhi()
    
    // 计算运势得分：基于五行相生相克关系
    // 日主五行得分 + 大运五行影响 + 流年五行影响 - 相克惩罚
    const dayElement = ELEMENT_MAP[dayGan]
    const daYunElement = ELEMENT_MAP[daYunDiZhi]
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
      year,
      score: Math.round(score),
      trend,
      description
    })
  }
  
  return {
    data,
    peakAge: maxScore > 80 ? { start: peakAgeStart, end: peakAgeEnd } : null,
    currentScore: data[Math.min(30, data.length - 1)]?.score || 50
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
