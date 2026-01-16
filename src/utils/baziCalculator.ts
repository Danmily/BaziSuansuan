import { Lunar, Solar } from 'lunar-typescript'

// 常量定义
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export interface BaziResult {
  year: {
    tianGan: string
    diZhi: string
  }
  month: {
    tianGan: string
    diZhi: string
  }
  day: {
    tianGan: string
    diZhi: string
  }
  hour: {
    tianGan: string
    diZhi: string
  }
}

/**
 * 计算完整的八字
 * 修正逻辑：严格按照节气划分月柱，按照五虎遁/五鼠遁推算天干
 */
export function calculateBazi(birthDate: string, birthTime: string): BaziResult | null {
  if (!birthDate || !birthTime) {
    return null
  }

  try {
    const [year, month, day] = birthDate.split('-').map(Number)
    const [hour, minute] = birthTime.split(':').map(Number)

    // 1. 使用 Lunar 库获取精确的干支信息
    // 该库会自动处理"立春换年"和"节气换月"的核心难题
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
    const lunar = solar.getLunar()

    // 2. 获取年、月、日柱
    // lunar.getYearInGanZhi() 会自动处理立春前后的年份切换
    const yearGZ = lunar.getYearInGanZhi()
    const monthGZ = lunar.getMonthInGanZhi()
    const dayGZ = lunar.getDayInGanZhi()

    // 3. 处理时柱 (五鼠遁)
    // 根据图片口诀：甲己还加甲，乙庚丙作初...
    const dayGan = dayGZ.substring(0, 1)
    const hourPillar = calculateHourPillarImproved(dayGan, hour)

    return {
      year: { tianGan: yearGZ[0], diZhi: yearGZ[1] },
      month: { tianGan: monthGZ[0], diZhi: monthGZ[1] },
      day: { tianGan: dayGZ[0], diZhi: dayGZ[1] },
      hour: hourPillar
    }
  } catch (error) {
    console.error('八字计算失败:', error)
    return null
  }
}

/**
 * 修正的时柱计算 (五鼠遁)
 * 对应图片2中的"五鼠遁日诀"
 */
function calculateHourPillarImproved(dayGan: string, hour: number): { tianGan: string; diZhi: string } {
  // 1. 确定地支：23点后算第二天子时 (夜子时)
  let zhiIndex = 0
  if (hour >= 23 || hour < 1) {
    zhiIndex = 0  // 子时
  } else if (hour >= 1 && hour < 3) {
    zhiIndex = 1  // 丑时
  } else if (hour >= 3 && hour < 5) {
    zhiIndex = 2  // 寅时
  } else if (hour >= 5 && hour < 7) {
    zhiIndex = 3  // 卯时
  } else if (hour >= 7 && hour < 9) {
    zhiIndex = 4  // 辰时
  } else if (hour >= 9 && hour < 11) {
    zhiIndex = 5  // 巳时
  } else if (hour >= 11 && hour < 13) {
    zhiIndex = 6  // 午时
  } else if (hour >= 13 && hour < 15) {
    zhiIndex = 7  // 未时
  } else if (hour >= 15 && hour < 17) {
    zhiIndex = 8  // 申时
  } else if (hour >= 17 && hour < 19) {
    zhiIndex = 9  // 酉时
  } else if (hour >= 19 && hour < 21) {
    zhiIndex = 10 // 戌时
  } else {
    zhiIndex = 11 // 亥时
  }

  const diZhi = DI_ZHI[zhiIndex]

  // 2. 五鼠遁推算天干
  // 口诀：甲己还加甲 (甲/己日 子时起甲)
  const startGanMap: { [key: string]: string } = {
    '甲': '甲',
    '己': '甲',
    '乙': '丙',
    '庚': '丙',
    '丙': '戊',
    '辛': '戊',
    '丁': '庚',
    '壬': '庚',
    '戊': '壬',
    '癸': '壬'
  }

  const startGan = startGanMap[dayGan]
  const startGanIndex = TIAN_GAN.indexOf(startGan)

  // 时干 = (子时天干索引 + 地支偏移) % 10
  const tianGan = TIAN_GAN[(startGanIndex + zhiIndex) % 10]

  return { tianGan, diZhi }
}

// 干支与五行的对应表
type ElementType = '木' | '火' | '土' | '金' | '水'

const ELEMENT_MAP: Record<string, ElementType> = {
  '甲': '木', '乙': '木', '寅': '木', '卯': '木',
  '丙': '火', '丁': '火', '巳': '火', '午': '火',
  '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '庚': '金', '辛': '金', '申': '金', '酉': '金',
  '壬': '水', '癸': '水', '亥': '水', '子': '水'
}

// 职业分类映射表（根据五行补弱原则）
const INDUSTRY_MAP: Record<ElementType, string[]> = {
  '木': ['艺术设计', '文化教育', '医疗养老', '环保园林', 'AI教育', 'AI文创', '医疗AI'],
  '火': ['AI/互联网', '能源电力', '餐饮娱乐', '广告传媒', 'AI产品经理', 'AI Agent开发'],
  '土': ['建筑房产', '土木工程', '农业畜牧', '仓储物流', '建筑AI', '智慧农业'],
  '金': ['金融投资', '精密制造', '法律司法', '汽车五金', '软件架构', '底层系统设计'],
  '水': ['国际贸易', '冷链物流', '航海旅游', '水利传播', '智慧水务', 'AI赋能传统贸易']
}

export interface FiveElementsScore {
  木: number
  火: number
  土: number
  金: number
  水: number
}

export interface JobRecommendation {
  suggestion: string
  industries: string[]
  scores: FiveElementsScore
  selfElement: ElementType
  bodyStrength: '身强' | '身弱'
  selfScore: number
  strongestElement: ElementType
  weakestElement: ElementType
}

/**
 * 五行得分计算器
 * 根据权重（8, 4, 12, 40, 12, 12, 12）进行加权求和
 */
export function calculateFiveElementsScore(bazi: BaziResult): FiveElementsScore {
  // 初始化得分
  const scores: FiveElementsScore = {
    '木': 0,
    '火': 0,
    '土': 0,
    '金': 0,
    '水': 0
  }

  // 定义权重配置 (按照提供的权重)
  const weights = [
    { key: bazi.year.tianGan, weight: 8 },   // 年干
    { key: bazi.year.diZhi, weight: 4 },    // 年支
    { key: bazi.month.tianGan, weight: 12 }, // 月干
    { key: bazi.month.diZhi, weight: 40 },   // 月支 (月令)
    { key: bazi.day.diZhi, weight: 12 },    // 日支
    { key: bazi.hour.tianGan, weight: 12 },  // 时干
    { key: bazi.hour.diZhi, weight: 12 }     // 时支
  ]

  // 累加得分
  weights.forEach(item => {
    const element = ELEMENT_MAP[item.key]
    if (element) {
      scores[element] += item.weight
    }
  })

  return scores
}

/**
 * 根据得分判断身强身弱和职业建议
 */
export function getRecommendedJobs(bazi: BaziResult): JobRecommendation {
  const scores = calculateFiveElementsScore(bazi)
  const selfElement = ELEMENT_MAP[bazi.day.tianGan] // 日主五行
  const selfScore = scores[selfElement] // 日主得分

  // 判断身强身弱：>50分就是身强，<50分就是身弱
  const bodyStrength: '身强' | '身弱' = selfScore > 50 ? '身强' : '身弱'

  // 找出得分最低的五行（通常作为补救的参考）
  const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1])
  const weakestElement = sortedScores[0][0] as ElementType

  // 找出得分最高的五行（代表能量最强）
  const strongestElement = sortedScores[sortedScores.length - 1][0] as ElementType

  // 职业逻辑：通常倾向于平衡，所以推荐"用神"（最弱的五行）
  const recommendedJobs = INDUSTRY_MAP[weakestElement] || []

  return {
    scores,
    selfElement,
    bodyStrength,
    selfScore,
    strongestElement,
    weakestElement,
    suggestion: `您的日主为${bazi.day.tianGan}（${selfElement}），得分为${selfScore}分，属于${bodyStrength}。目前排盘中能量最强的是${strongestElement}（${scores[strongestElement]}分），最需要补益的是${weakestElement}（${scores[weakestElement]}分）。`,
    industries: recommendedJobs
  }
}

/**
 * 辅助函数：干支转五行（保留用于兼容）
 */
function getFiveElement(name: string): string {
  return ELEMENT_MAP[name] || '未知'
}
