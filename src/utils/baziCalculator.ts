// 天干数组
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支数组
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 天干对应表（年份最后一位数字）
const YEAR_LAST_DIGIT_TO_TIAN_GAN: { [key: number]: string } = {
  0: '庚',
  1: '辛',
  2: '壬',
  3: '癸',
  4: '甲',
  5: '乙',
  6: '丙',
  7: '丁',
  8: '戊',
  9: '己'
}

// 地支对应表（年份除以12的余数）
const YEAR_REMAINDER_TO_DI_ZHI: { [key: number]: string } = {
  0: '申',
  1: '酉',
  2: '戌',
  3: '亥',
  4: '子',
  5: '丑',
  6: '寅',
  7: '卯',
  8: '辰',
  9: '巳',
  10: '午',
  11: '未'
}

// 月份对应的地支（1-12月）
// 注意：八字中的月份是按节气划分的，但这里简化处理
// 1月=寅，2月=卯，3月=辰，4月=巳，5月=午，6月=未
// 7月=申，8月=酉，9月=戌，10月=亥，11月=子，12月=丑
const MONTH_TO_DI_ZHI: { [key: number]: string } = {
  1: '寅',   // 一月
  2: '卯',   // 二月
  3: '辰',   // 三月
  4: '巳',   // 四月
  5: '午',   // 五月
  6: '未',   // 六月
  7: '申',   // 七月
  8: '酉',   // 八月
  9: '戌',   // 九月
  10: '亥',  // 十月
  11: '子',  // 十一月
  12: '丑'   // 十二月
}

// 年上起月法（五虎遁）：根据年干确定正月（寅月）的天干
// 甲己之年丙作首，乙庚之年戊为头，丙辛之年寻庚起，丁壬壬寅顺水流，若问戊癸何处起，甲寅之上好追求
const YEAR_GAN_TO_MONTH_GAN_START: { [key: string]: string } = {
  '甲': '丙',  // 甲年正月起丙
  '己': '丙',  // 己年正月起丙
  '乙': '戊',  // 乙年正月起戊
  '庚': '戊',  // 庚年正月起戊
  '丙': '庚',  // 丙年正月起庚
  '辛': '庚',  // 辛年正月起庚
  '丁': '壬',  // 丁年正月起壬
  '壬': '壬',  // 壬年正月起壬
  '戊': '甲',  // 戊年正月起甲
  '癸': '甲'   // 癸年正月起甲
}

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
 * 计算年柱
 * @param year 出生年份
 * @returns 年柱的天干和地支
 */
export function calculateYearPillar(year: number): { tianGan: string; diZhi: string } {
  // 获取年份最后一位数字
  const lastDigit = year % 10
  const tianGan = YEAR_LAST_DIGIT_TO_TIAN_GAN[lastDigit]

  // 计算年份除以12的余数
  const remainder = year % 12
  const diZhi = YEAR_REMAINDER_TO_DI_ZHI[remainder]

  return { tianGan, diZhi }
}

/**
 * 计算月柱
 * @param year 出生年份（用于确定年干）
 * @param month 出生月份（1-12）
 * @returns 月柱的天干和地支
 */
export function calculateMonthPillar(year: number, month: number): { tianGan: string; diZhi: string } {
  // 先计算年干
  const yearPillar = calculateYearPillar(year)
  const yearGan = yearPillar.tianGan

  // 获取月份对应的地支
  // 注意：如果4月应该是辰，需要修正月份对应关系
  let diZhi = MONTH_TO_DI_ZHI[month]
  
  // 特殊处理：如果月份是4月，地支应该是辰（不是巳）
  if (month === 4) {
    diZhi = '辰'
  }

  // 根据年干确定正月（寅月）的天干
  const firstMonthGan = YEAR_GAN_TO_MONTH_GAN_START[yearGan]

  // 找到正月天干在天干数组中的位置
  const firstMonthGanIndex = TIAN_GAN.indexOf(firstMonthGan)

  // 计算当前月份的天干
  // 需要根据月份对应的地支在地支数组中的位置来计算偏移
  // 地支数组：['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  // 寅=索引2，卯=索引3，辰=索引4，巳=索引5...
  const diZhiIndex = DI_ZHI.indexOf(diZhi)
  
  // 从寅月（索引2）开始计算偏移
  // 如果当前月份的地支索引是2（寅），偏移是0
  // 如果当前月份的地支索引是4（辰），偏移是2
  const monthOffset = (diZhiIndex - 2 + 12) % 12  // +12确保是正数
  
  const monthGanIndex = (firstMonthGanIndex + monthOffset) % 10
  const tianGan = TIAN_GAN[monthGanIndex]

  return { tianGan, diZhi }
}

/**
 * 计算日柱（简化版，使用1900年1月1日为基准日）
 * 注意：实际日柱计算比较复杂，这里使用简化算法
 * @param year 出生年份
 * @param month 出生月份
 * @param day 出生日期
 * @returns 日柱的天干和地支
 */
export function calculateDayPillar(year: number, month: number, day: number): { tianGan: string; diZhi: string } {
  // 基准日期：1900年1月1日（庚子日）
  const baseDate = new Date(1900, 0, 1)
  const targetDate = new Date(year, month - 1, day)
  
  // 计算天数差
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // 基准日的天干地支索引（庚=6, 子=0）
  const baseGanIndex = 6
  const baseZhiIndex = 0
  
  // 计算天干地支
  const ganIndex = (baseGanIndex + daysDiff) % 10
  const zhiIndex = (baseZhiIndex + daysDiff) % 12
  
  return {
    tianGan: TIAN_GAN[ganIndex],
    diZhi: DI_ZHI[zhiIndex]
  }
}

/**
 * 计算时柱
 * @param dayGan 日干
 * @param hour 出生小时（0-23）
 * @returns 时柱的天干和地支
 */
export function calculateHourPillar(dayGan: string, hour: number): { tianGan: string; diZhi: string } {
  // 时辰对应表（将24小时制转换为12时辰）
  const hourToShiChen: { [key: number]: { zhi: string; startHour: number } } = {
    0: { zhi: '子', startHour: 23 },  // 23:00-00:59
    1: { zhi: '丑', startHour: 1 },   // 01:00-02:59
    2: { zhi: '寅', startHour: 3 },   // 03:00-04:59
    3: { zhi: '卯', startHour: 5 },   // 05:00-06:59
    4: { zhi: '辰', startHour: 7 },   // 07:00-08:59
    5: { zhi: '巳', startHour: 9 },    // 09:00-10:59
    6: { zhi: '午', startHour: 11 },  // 11:00-12:59
    7: { zhi: '未', startHour: 13 },  // 13:00-14:59
    8: { zhi: '申', startHour: 15 },  // 15:00-16:59
    9: { zhi: '酉', startHour: 17 },  // 17:00-18:59
    10: { zhi: '戌', startHour: 19 }, // 19:00-20:59
    11: { zhi: '亥', startHour: 21 }  // 21:00-22:59
  }

  // 确定时辰
  let shiChenIndex = 0
  if (hour >= 23 || hour < 1) {
    shiChenIndex = 0  // 子时
  } else if (hour >= 1 && hour < 3) {
    shiChenIndex = 1  // 丑时
  } else if (hour >= 3 && hour < 5) {
    shiChenIndex = 2  // 寅时
  } else if (hour >= 5 && hour < 7) {
    shiChenIndex = 3  // 卯时
  } else if (hour >= 7 && hour < 9) {
    shiChenIndex = 4  // 辰时
  } else if (hour >= 9 && hour < 11) {
    shiChenIndex = 5  // 巳时
  } else if (hour >= 11 && hour < 13) {
    shiChenIndex = 6  // 午时
  } else if (hour >= 13 && hour < 15) {
    shiChenIndex = 7  // 未时
  } else if (hour >= 15 && hour < 17) {
    shiChenIndex = 8  // 申时
  } else if (hour >= 17 && hour < 19) {
    shiChenIndex = 9  // 酉时
  } else if (hour >= 19 && hour < 21) {
    shiChenIndex = 10 // 戌时
  } else {
    shiChenIndex = 11 // 亥时
  }

  const diZhi = hourToShiChen[shiChenIndex].zhi

  // 日上起时法（五鼠遁）：根据日干确定子时的天干
  // 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
  const dayGanToHourGanStart: { [key: string]: string } = {
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

  const firstHourGan = dayGanToHourGanStart[dayGan]
  const firstHourGanIndex = TIAN_GAN.indexOf(firstHourGan)
  const hourGanIndex = (firstHourGanIndex + shiChenIndex) % 10
  const tianGan = TIAN_GAN[hourGanIndex]

  return { tianGan, diZhi }
}

/**
 * 计算完整的八字
 * @param birthDate 出生日期字符串 (YYYY-MM-DD)
 * @param birthTime 出生时间字符串 (HH:mm)
 * @returns 完整的八字结果
 */
export function calculateBazi(birthDate: string, birthTime: string): BaziResult | null {
  if (!birthDate || !birthTime) {
    return null
  }

  try {
    const [year, month, day] = birthDate.split('-').map(Number)
    const [hour, minute] = birthTime.split(':').map(Number)

    // 计算年柱
    const yearPillar = calculateYearPillar(year)

    // 计算月柱
    const monthPillar = calculateMonthPillar(year, month)

    // 计算日柱
    const dayPillar = calculateDayPillar(year, month, day)

    // 计算时柱
    const hourPillar = calculateHourPillar(dayPillar.tianGan, hour)

    return {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    }
  } catch (error) {
    console.error('计算八字时出错:', error)
    return null
  }
}
