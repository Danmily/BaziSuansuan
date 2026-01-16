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
