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

export const ELEMENT_MAP: Record<string, ElementType> = {
  '甲': '木', '乙': '木', '寅': '木', '卯': '木',
  '丙': '火', '丁': '火', '巳': '火', '午': '火',
  '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '庚': '金', '辛': '金', '申': '金', '酉': '金',
  '壬': '水', '癸': '水', '亥': '水', '子': '水'
}

// 命格名称映射
const MING_GE_NAMES: Record<ElementType, string> = {
  '木': '「草木生机」',
  '火': '「烈火真金」',
  '土': '「厚德载物」',
  '金': '「刀剑金石」',
  '水': '「江河湖海」'
}

// 命格性格描述
const MING_GE_DESCRIPTIONS: Record<ElementType, string> = {
  '木': '仁慈温和,有创造力,具有人文关怀',
  '火': '热情活跃,果断刚毅,具有领袖气质',
  '土': '稳重踏实,包容大度,具有责任心',
  '金': '果断刚毅,重情重义,有侠客风范',
  '水': '智慧灵活,适应力强,具有变通性'
}

// 职业发展数据库
const VOCATIONAL_DATABASE: Record<ElementType, {
  characteristics: string
  industries: string[]
  positions: string[]
}> = {
  '木': {
    characteristics: '木主仁慈、生发、创造，适合需要创意、成长性和人文关怀的工作',
    industries: ['教育培训', '文化出版', '园林绿化', '木材加工', '纺织服装', '医药健康'],
    positions: ['教师', '编辑', '设计师', '咨询顾问', '园艺师', '中医师', '文案策划', '产品经理']
  },
  '火': {
    characteristics: '火主礼貌、热情、光明，适合能源、互联网、传播、迭代快速的工作',
    industries: ['互联网/AI', '能源电力', '餐饮娱乐', '广告传媒', '美容化工', '光学电子'],
    positions: ['软件架构师', 'AI产品经理', '品牌推广', '创意导演', '电气工程师', '演艺人员']
  },
  '土': {
    characteristics: '土主诚信、包容、厚重，适合房地产、基础设施、农牧、保障类工作',
    industries: ['房产建筑', '农牧土产', '矿产石材', '仓储物流', '法律法条', '古玩收藏'],
    positions: ['项目经理', '财务会计', '法务专员', '土木工程师', '仓库主管', '资深顾问']
  },
  '金': {
    characteristics: '金主正义、硬朗、精密，适合金融、法律、规则、制造硬核技术工作',
    industries: ['金融投资', '精密制造', '珠宝饰品', '汽车工程', '武职司法', '五金机电'],
    positions: ['金融分析师', '法官/律师', '机械设计', '安全工程师', '系统架构师', '外科医生']
  },
  '水': {
    characteristics: '水主智慧、灵动、流动，适合贸易、物流、策划、需要多变应对的工作',
    industries: ['国际贸易', '现代物流', '旅游观光', '水利水产', '新闻出版', '心理研究'],
    positions: ['市场策划', '心理医生', '外贸主管', '高级导游', '调查记者', '水产专家']
  }
}

// 五行颜色映射
export const ELEMENT_COLORS: Record<ElementType, {
  bg: string
  bgLight: string
  bgButton: string
  border: string
  text: string
  textDark: string
  hover: string
}> = {
  '木': {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    bgButton: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-600',
    textDark: 'text-green-700',
    hover: 'hover:bg-green-200'
  },
  '火': {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    bgButton: 'bg-red-100',
    border: 'border-red-200',
    text: 'text-red-600',
    textDark: 'text-red-700',
    hover: 'hover:bg-red-200'
  },
  '土': {
    bg: 'bg-amber-600',
    bgLight: 'bg-amber-50',
    bgButton: 'bg-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-600',
    textDark: 'text-amber-700',
    hover: 'hover:bg-amber-200'
  },
  '金': {
    bg: 'bg-yellow-400',
    bgLight: 'bg-yellow-50',
    bgButton: 'bg-yellow-200',
    border: 'border-yellow-300',
    text: 'text-yellow-500',
    textDark: 'text-yellow-600',
    hover: 'hover:bg-yellow-300'
  },
  '水': {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    bgButton: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-600',
    textDark: 'text-blue-700',
    hover: 'hover:bg-blue-200'
  }
}


export interface FiveElementsScore {
  木: number
  火: number
  土: number
  金: number
  水: number
}

export interface MingGeInfo {
  name: string // 命格名称，如「刀剑金石」
  description: string // 命格描述
  favorableGods: string[] // 喜用神
  unfavorableGods: string[] // 忌神
  advice: string // 命格建议
}

export interface JobRecommendation {
  suggestion: string
  industries: string[]
  positions: string[]
  selfElementDescription: string
  scores: FiveElementsScore
  selfElement: ElementType
  bodyStrength: '身强' | '身弱'
  selfScore: number
  strongestElement: ElementType
  weakestElement: ElementType
  elementColors: typeof ELEMENT_COLORS[ElementType]
  mingGe: MingGeInfo
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
 * 计算喜用神和忌神
 */
function calculateGods(selfElement: ElementType, bodyStrength: '身强' | '身弱', scores: FiveElementsScore): {
  favorableGods: string[]
  unfavorableGods: string[]
} {
  // 五行相克关系：木克土，火克金，土克水，金克木，水克火
  // 五行相生关系：木生火，火生土，土生金，金生水，水生木
  
  const elementOrder: ElementType[] = ['木', '火', '土', '金', '水']
  const selfIndex = elementOrder.indexOf(selfElement)
  
  // 财星：我克的（下下一位）
  const wealthStar = elementOrder[(selfIndex + 2) % 5]
  // 官杀：克我的（上上一位）
  const officerStar = elementOrder[(selfIndex - 2 + 5) % 5]
  // 印星：生我的（上一位）
  const resourceStar = elementOrder[(selfIndex - 1 + 5) % 5]
  // 比劫：同我的（相同）
  const friendStar = selfElement
  // 食伤：我生的（下一位）
  const foodStar = elementOrder[(selfIndex + 1) % 5]
  
  if (bodyStrength === '身强') {
    // 身强：喜用神是克、泄、耗日主的（财星、官杀、食伤），忌神是生、助日主的（印星、比劫）
    return {
      favorableGods: ['财星', '官杀'],
      unfavorableGods: ['印星', '比劫']
    }
  } else {
    // 身弱：喜用神是生、助日主的（印星、比劫），忌神是克、泄、耗日主的（财星、官杀）
    return {
      favorableGods: ['印星', '比劫'],
      unfavorableGods: ['财星', '官杀']
    }
  }
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
  const weakElements: string[] = []
  sortedScores.forEach(([element, score]) => {
    if (score < 20) {
      weakElements.push(ELEMENT_MAP[element as any] || element)
    }
  })

  // 找出得分最高的五行（代表能量最强）
  const strongestElement = sortedScores[sortedScores.length - 1][0] as ElementType

  // 计算喜用神和忌神
  const gods = calculateGods(selfElement, bodyStrength, scores)

  // 根据日主五行获取对应的职业发展建议
  const vocationalData = VOCATIONAL_DATABASE[selfElement] || {
    characteristics: '',
    industries: [],
    positions: []
  }
  
  const recommendedIndustries = vocationalData.industries || []
  const recommendedPositions = vocationalData.positions || []
  const selfElementDescription = vocationalData.characteristics || ''

  // 生成命格信息
  const mingGeText = `${selfElement}命・${bodyStrength}・${strongestElement}旺${weakElements.length > 0 ? `・缺${weakElements.join('')}` : ''}`
  
  const mingGe: MingGeInfo = {
    name: MING_GE_NAMES[selfElement],
    description: mingGeText,
    favorableGods: gods.favorableGods,
    unfavorableGods: gods.unfavorableGods,
    advice: bodyStrength === '身强' 
      ? '适合独立创业、领导岗位,但要注意控制脾气,学会倾听'
      : '适合团队合作、辅助岗位,需要增强自信,培养独立性'
  }

  return {
    scores,
    selfElement,
    bodyStrength,
    selfScore,
    strongestElement,
    weakestElement,
    selfElementDescription,
    elementColors: ELEMENT_COLORS[selfElement],
    suggestion: `您的日主为${bazi.day.tianGan}（${selfElement}），得分为${selfScore}分，属于${bodyStrength}。目前排盘中能量最强的是${strongestElement}（${scores[strongestElement]}分），最需要补益的是${weakestElement}（${scores[weakestElement]}分）。`,
    industries: recommendedIndustries,
    positions: recommendedPositions,
    mingGe
  }
}

/**
 * 辅助函数：干支转五行（保留用于兼容）
 */
function getFiveElement(name: string): string {
  return ELEMENT_MAP[name] || '未知'
}
