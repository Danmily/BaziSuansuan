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

// 五行特性描述
const ELEMENT_DESCRIPTION: Record<ElementType, string> = {
  '木': '木主仁慈、生发、创造，适合需要创意、成长性和人文关怀的工作',
  '火': '火主热情、活跃、传播，适合需要表达、创新和快速迭代的工作',
  '土': '土主稳定、承载、包容，适合需要耐心、责任和实际执行的工作',
  '金': '金主收敛、规则、严谨，适合需要逻辑、系统和精准控制的工作',
  '水': '水主流动、智慧、适应，适合需要灵活、沟通和资源整合的工作'
}

// 行业领域分类（根据五行补弱原则）
const INDUSTRY_MAP: Record<ElementType, string[]> = {
  '木': ['教育培训', '文化出版', '园林绿化', '木材加工', '纺织服装', '医药健康'],
  '火': ['互联网科技', '能源电力', '餐饮娱乐', '广告传媒', '演艺事业', '美容美发'],
  '土': ['房地产', '建筑工程', '农业畜牧', '仓储物流', '石材加工', '防水材料'],
  '金': ['金融投资', '精密制造', '法律司法', '汽车工业', '五金器材', '珠宝鉴定'],
  '水': ['国际贸易', '冷链物流', '航海旅游', '水利工程', '传播媒体', '咨询服务']
}

// 职位类型分类
const JOB_POSITION_MAP: Record<ElementType, string[]> = {
  '木': ['教师', '设计师', '园艺师', '文案策划', '编辑', '咨询顾问', '中医师', '产品经理'],
  '火': ['产品经理', '营销专员', '运营经理', '主播', '演员', '广告创意', '电气工程师', '网络工程师'],
  '土': ['建筑工程师', '项目经理', '农业技术员', '物流管理', '质检员', '采购员', '房产销售', '土地评估'],
  '金': ['金融分析师', '软件架构师', '律师', '机械工程师', '审计员', '质量管理', '系统分析师', '数据分析师'],
  '水': ['贸易专员', '物流经理', '市场营销', '媒体编辑', '咨询顾问', '销售经理', '导游', '人力资源']
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
  positions: string[]
  selfElementDescription: string
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
  // 但显示日主五行的特性描述
  const recommendedIndustries = INDUSTRY_MAP[weakestElement] || []
  const recommendedPositions = JOB_POSITION_MAP[weakestElement] || []
  const selfElementDescription = ELEMENT_DESCRIPTION[selfElement] || ''

  return {
    scores,
    selfElement,
    bodyStrength,
    selfScore,
    strongestElement,
    weakestElement,
    selfElementDescription,
    suggestion: `您的日主为${bazi.day.tianGan}（${selfElement}），得分为${selfScore}分，属于${bodyStrength}。目前排盘中能量最强的是${strongestElement}（${scores[strongestElement]}分），最需要补益的是${weakestElement}（${scores[weakestElement]}分）。`,
    industries: recommendedIndustries,
    positions: recommendedPositions
  }
}

/**
 * 辅助函数：干支转五行（保留用于兼容）
 */
function getFiveElement(name: string): string {
  return ELEMENT_MAP[name] || '未知'
}
