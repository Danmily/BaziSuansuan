// AI分析服务 - 支持多个API提供商
import { getApiKeyConfig } from '../components/ApiKeySettings'

export interface AIAnalysisRequest {
  bazi: {
    year: string
    month: string
    day: string
    hour: string
  }
  gender: '男' | '女'
  birthDateTime: string
  birthLocation?: string // 出生地
  lifeEvents?: string // 人生关键节点
  jobRecommendation: {
    selfElement: string
    bodyStrength: string
    scores: Record<string, number>
    industries: string[]
    positions: string[]
  }
  lifeKline: {
    peakAge: { start: number; end: number } | null
    dayunInfo: {
      currentDayun: string
      luckTrend: string
      startAgeDetail: string
      direction: '顺排' | '逆排'
      dayunList: Array<{
        tianGan: string
        diZhi: string
        startAge: number
        endAge: number
        ageRange: string
      }>
    }
  }
}

export interface AIAnalysisResponse {
  analysis: string
  suggestions: string[]
  warnings: string[]
  godsRecommendation?: {
    favorableGods: string[]
    unfavorableGods: string[]
    advice?: string
  }
}

// API提供商类型
type APIProvider = 'deepseek' | 'doubao' | 'openai' | 'gemini'

// 获取API配置（优先使用localStorage，其次环境变量）
function getAPIConfig(): { provider: APIProvider; apiKey: string; baseURL?: string } {
  // 优先从localStorage获取
  const savedConfig = getApiKeyConfig()
  if (savedConfig) {
    return {
      provider: savedConfig.provider,
      apiKey: savedConfig.apiKey,
      baseURL: savedConfig.baseURL
    }
  }

  // 其次使用环境变量
  const apiKey = import.meta.env.VITE_AI_API_KEY || ''
  const provider = (import.meta.env.VITE_AI_PROVIDER || 'deepseek') as APIProvider
  const baseURL = import.meta.env.VITE_AI_BASE_URL || undefined

  return { provider, apiKey, baseURL }
}

/**
 * 构建AI分析的提示词（使用用户提供的专业模板）
 */
function buildPrompt(request: AIAnalysisRequest, includeGods: boolean = false): string {
  const { bazi, gender, birthDateTime, birthLocation, lifeEvents, jobRecommendation, lifeKline } = request

  // 格式化八字
  const baziString = `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`

  // 从出生日期提取年份
  const birthYear = parseInt(birthDateTime.split('-')[0] || birthDateTime.split(' ')[0])

  // 格式化大运信息：计算大运对应的年份
  const dayunString = lifeKline.dayunInfo.dayunList
    .map((d) => {
      // 大运开始的年份 = 出生年份 + 起运年龄
      const startYear = birthYear + d.startAge
      return `${startYear}年${d.tianGan}${d.diZhi}运`
    })
    .join('、')

  let prompt = `请你以专业四柱八字研究者的身份,结合《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法,为我进行全面八字分析。我的信息如下:${gender}命,八字为${baziString},${birthLocation ? `出生地${birthLocation},` : ''}大运依次为${dayunString}。请依据命盘中的刑冲破害与五行生克关系,系统分析十神配置与体用平衡,注重逻辑严谨与信息交叉验证。
${lifeEvents ? `为提升预测准确性,我提供以下关键人生节点供参考:${lifeEvents}。` : ''}请你基于命理技法客观推演,避免主观臆断,用语不必委婉,直接结合各运流年,逐运分析我的财富等级、身体状况等具体问题。注意排大运规则:阳年(甲丙戊庚壬)男命与阴年(乙丁己辛癸)女命顺排;阴年男命与阳年女命逆排,均以月柱干支为基准。

**重要要求:**
1. 请使用Markdown格式输出分析结果,使用标题、列表、加粗等格式来组织内容
2. 使用 ### 作为主要章节标题(如: ### 命盘总览、### ⚖️ 十神与体用分析)
3. 使用 **加粗** 来强调重要概念
4. 使用列表来组织要点,保持内容结构化、层次清晰`

  if (includeGods) {
    prompt += `\n\n5. 在分析的最后,以JSON格式输出喜用神信息(请将JSON放在代码块中):\n\`\`\`json\n{\n  "favorableGods": ["印星", "比劫"],\n  "unfavorableGods": ["财星", "官杀"],\n  "advice": "适合团队合作、辅助岗位,需要增强自信,培养独立性"\n}\n\`\`\``
  }

  prompt += `\n\n请综合多次迭代后输出准确结论,确保使用Markdown格式使内容清晰易读。`
  return prompt
}

/**
 * 调用DeepSeek API
 */
async function callDeepSeekAPI(
  prompt: string,
  apiKey: string,
  baseURL?: string,
  systemMessage?: string
): Promise<string> {
  const url = baseURL || 'https://api.deepseek.com/v1/chat/completions'

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage || '你是一位专业的四柱八字研究者，精通《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })
  } catch (networkError) {
    throw new Error('网络连接失败，请检查网络设置或API地址是否正确')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    const errorMessage = error.error?.message || response.statusText
    
    // 识别API key相关的错误
    if (response.status === 401 || response.status === 403) {
      throw new Error('API密钥无效或已过期，请检查API Key设置')
    }
    
    if (response.status === 429) {
      throw new Error('API调用频率过高，请稍后再试')
    }
    
    // 网络相关错误
    throw new Error(`API请求失败: ${errorMessage} (状态码: ${response.status})`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || '分析失败，请稍后重试'
}

/**
 * 调用豆包 API（火山引擎）
 */
async function callDoubaoAPI(
  prompt: string,
  apiKey: string,
  baseURL?: string,
  systemMessage?: string
): Promise<string> {
  // 豆包API需要从baseURL中提取endpoint
  const endpoint = baseURL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  
  // 豆包API使用不同的认证方式，通常需要app_id
  // 这里假设API Key包含了app_id信息，格式可能是 "app_id:api_key"
  const [appId, actualKey] = apiKey.includes(':') ? apiKey.split(':') : ['', apiKey]

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${actualKey || apiKey}`
    },
    body: JSON.stringify({
      model: 'ep-20241208145625-xxxxx', // 需要替换为实际的模型ID
      messages: [
        {
          role: 'system',
          content: systemMessage || '你是一位专业的四柱八字研究者，精通《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    const errorMessage = error.error?.message || response.statusText
    
    // 识别API key相关的错误
    if (response.status === 401 || response.status === 403) {
      throw new Error('API密钥无效或已过期，请检查API Key设置')
    }
    
    if (response.status === 429) {
      throw new Error('API调用频率过高，请稍后再试')
    }
    
    // 网络相关错误
    throw new Error(`API请求失败: ${errorMessage} (状态码: ${response.status})`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || '分析失败，请稍后重试'
}

/**
 * 调用OpenAI API
 */
async function callOpenAIAPI(
  prompt: string,
  apiKey: string,
  baseURL?: string,
  systemMessage?: string
): Promise<string> {
  const url = baseURL || 'https://api.openai.com/v1/chat/completions'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemMessage || '你是一位专业的四柱八字研究者，精通《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    const errorMessage = error.error?.message || response.statusText
    
    // 识别API key相关的错误
    if (response.status === 401 || response.status === 403) {
      throw new Error('API密钥无效或已过期，请检查API Key设置')
    }
    
    if (response.status === 429) {
      throw new Error('API调用频率过高，请稍后再试')
    }
    
    // 网络相关错误
    throw new Error(`API请求失败: ${errorMessage} (状态码: ${response.status})`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || '分析失败，请稍后重试'
}

/**
 * 调用Gemini API
 */
async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  baseURL?: string,
  systemMessage?: string
): Promise<string> {
  // Gemini API 使用不同的endpoint格式
  const endpoint = `${baseURL || 'https://generativelanguage.googleapis.com/v1beta'}/models/gemini-pro:generateContent?key=${apiKey}`

  const systemMsg = systemMessage || '你是一位专业的四柱八字研究者，精通《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法。'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemMsg}\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000
      }
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    const errorMessage = error.error?.message || response.statusText
    
    // 识别API key相关的错误
    if (response.status === 401 || response.status === 403) {
      throw new Error('API密钥无效或已过期，请检查API Key设置')
    }
    
    if (response.status === 429) {
      throw new Error('API调用频率过高，请稍后再试')
    }
    
    // 网络相关错误
    throw new Error(`API请求失败: ${errorMessage} (状态码: ${response.status})`)
  }

  const data = await response.json()
  return data.candidates[0]?.content?.parts[0]?.text || '分析失败，请稍后重试'
}

/**
 * 解析AI返回的分析结果
 */
function parseAnalysisResponse(aiResponse: string, removeGodsJson: boolean = false): AIAnalysisResponse {
  // 尝试解析结构化的响应
  // 如果AI返回的是纯文本，则直接使用
  let analysis = aiResponse.trim()

  // 如果需要在分析结果中移除喜用神JSON信息
  if (removeGodsJson) {
    // 移除JSON代码块（包含favorableGods的）
    analysis = analysis.replace(/```json\s*\{[\s\S]*?"favorableGods"[\s\S]*?\}\s*```/gi, '')
    analysis = analysis.replace(/\{[\s\S]*?"favorableGods"[\s\S]*?\}/g, '')
    analysis = analysis.trim()
  }

  // 尝试提取建议和警告（如果AI返回了结构化内容）
  const suggestions: string[] = []
  const warnings: string[] = []
  let godsRecommendation: { favorableGods: string[]; unfavorableGods: string[]; advice?: string } | undefined

  // 尝试提取JSON格式的喜用神信息（仅在需要时）
  if (!removeGodsJson) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*"favorableGods"[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        const parsed = JSON.parse(jsonStr)
        if (parsed.favorableGods && Array.isArray(parsed.favorableGods)) {
          godsRecommendation = {
            favorableGods: parsed.favorableGods,
            unfavorableGods: parsed.unfavorableGods || [],
            advice: parsed.advice
          }
        }
      }
    } catch (error) {
      console.error('解析喜用神信息失败:', error)
    }
  }

  // 简单的文本解析逻辑（可以根据实际AI响应格式调整）
  const suggestionMatches = analysis.match(/建议[：:]\s*([^\n]+)/g)
  if (suggestionMatches) {
    suggestionMatches.forEach(match => {
      const content = match.replace(/建议[：:]\s*/, '')
      if (content) suggestions.push(content)
    })
  }

  const warningMatches = analysis.match(/注意[：:]\s*([^\n]+)/g)
  if (warningMatches) {
    warningMatches.forEach(match => {
      const content = match.replace(/注意[：:]\s*/, '')
      if (content) warnings.push(content)
    })
  }

  return {
    analysis,
    suggestions: suggestions.length > 0 ? suggestions : [],
    warnings: warnings.length > 0 ? warnings : [],
    godsRecommendation
  }
}

/**
 * 调用AI分析服务
 */
export async function getAIAnalysis(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  const config = getAPIConfig()

  if (!config.apiKey) {
    throw new Error('未配置AI API密钥，请前往设置页面配置API Key')
  }

  const prompt = buildPrompt(request, false) // AI分析不包含喜用神信息
  let aiResponse: string

  try {
    switch (config.provider) {
      case 'deepseek':
        aiResponse = await callDeepSeekAPI(prompt, config.apiKey, config.baseURL)
        break
      case 'doubao':
        aiResponse = await callDoubaoAPI(prompt, config.apiKey, config.baseURL)
        break
      case 'openai':
        aiResponse = await callOpenAIAPI(prompt, config.apiKey, config.baseURL)
        break
      case 'gemini':
        aiResponse = await callGeminiAPI(prompt, config.apiKey, config.baseURL)
        break
      default:
        throw new Error(`不支持的API提供商: ${config.provider}`)
    }

    return parseAnalysisResponse(aiResponse, true) // AI分析结果中移除喜用神JSON
  } catch (error) {
    console.error('AI分析失败:', error)
    throw error
  }
}

/**
 * 获取AI分析（带重试机制）
 */
export async function getAIAnalysisWithRetry(
  request: AIAnalysisRequest,
  maxRetries: number = 2
): Promise<AIAnalysisResponse> {
  let lastError: Error | null = null

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await getAIAnalysis(request)
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError || new Error('AI分析失败')
}

/**
 * 获取AI喜用神和忌神推荐
 */
export async function getAIGodsRecommendation(
  request: AIAnalysisRequest
): Promise<{ favorableGods: string[]; unfavorableGods: string[]; advice?: string }> {
  const config = getAPIConfig()

  if (!config.apiKey) {
    throw new Error('未配置AI API密钥，请前往设置页面配置API Key')
  }

  const prompt = buildPrompt(request, true)
  let aiResponse: string

  try {
    switch (config.provider) {
      case 'deepseek':
        aiResponse = await callDeepSeekAPI(prompt, config.apiKey, config.baseURL)
        break
      case 'doubao':
        aiResponse = await callDoubaoAPI(prompt, config.apiKey, config.baseURL)
        break
      case 'openai':
        aiResponse = await callOpenAIAPI(prompt, config.apiKey, config.baseURL)
        break
      case 'gemini':
        aiResponse = await callGeminiAPI(prompt, config.apiKey, config.baseURL)
        break
      default:
        throw new Error(`不支持的API提供商: ${config.provider}`)
    }

    const response = parseAnalysisResponse(aiResponse)
    
    // 如果解析到喜用神信息，返回它
    if (response.godsRecommendation) {
      return response.godsRecommendation
    }

    // 否则尝试从分析文本中提取
    // 这里可以添加更复杂的文本解析逻辑
    throw new Error('未能解析到喜用神信息')
  } catch (error) {
    console.error('AI喜用神分析失败:', error)
    throw error
  }
}

// 穿搭推荐接口
export interface FashionRecommendation {
  style: string // 风格描述
  colors: Array<{
    name: string // 颜色名称
    hex: string // 颜色代码
    description?: string // 颜色说明
  }>
  items: string[] // 单品建议
  locations: Array<{
    name: string // 地点名称
    direction: string // 方位
    reason: string // 推荐理由
  }>
}

/**
 * 构建穿搭推荐的提示词
 */
function buildFashionPrompt(request: AIAnalysisRequest): string {
  const { bazi, gender, jobRecommendation } = request
  const baziString = `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`
  
  return `请你以专业四柱八字研究者的身份，结合《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法，为${gender}命（八字：${baziString}）提供穿搭推荐。

【命理信息】
- 日主五行：${jobRecommendation.selfElement}
- 身强身弱：${jobRecommendation.bodyStrength}
- 五行得分：木${jobRecommendation.scores['木']}分、火${jobRecommendation.scores['火']}分、土${jobRecommendation.scores['土']}分、金${jobRecommendation.scores['金']}分、水${jobRecommendation.scores['水']}分

请根据命盘中的五行生克关系、喜用神和忌神，提供以下内容的JSON格式输出：

1. **风格名称**：总结适合的穿搭风格（如"新中式智能休闲风"等）
2. **推荐颜色**：必须推荐4种具体颜色，每种颜色包含：
   - 颜色名称（中文，如"墨绿色"、"深海蓝"等）
   - 颜色代码（hex格式，如#2F4F2F、#1E3A8A等，确保颜色准确）
   - 颜色说明（详细说明此颜色如何对应八字五行喜忌，结合命理分析为什么适合，如"此命庚金生于丑月，土厚金埋，身弱喜水木疏土生金。墨绿色属木，能疏厚土、助日主..."等）
3. **单品建议**：推荐4-6件具体单品（如"立领盘扣衬衫"、"机能面料束脚裤"等）
4. **桃花邂逅地**：推荐2-3个适合的邂逅地点，每个地点包含：
   - 地点名称
   - 方位（如"西北方"、"南方"等）
   - 推荐理由（结合八字命理分析为什么这个方位和地点适合）

请以JSON格式输出，格式如下：
{
  "style": "风格名称",
  "colors": [
    {"name": "颜色名称", "hex": "#颜色代码", "description": "说明"},
    ...
  ],
  "items": ["单品1", "单品2", ...],
  "locations": [
    {"name": "地点名称", "direction": "方位", "reason": "推荐理由"},
    ...
  ]
}

请直接返回JSON，不要有其他文字说明。`
}

/**
 * 调用AI生成穿搭推荐
 */
async function callFashionAPI(
  prompt: string,
  provider: APIProvider,
  apiKey: string,
  baseURL?: string
): Promise<string> {
  const systemMessage = '你是一位专业的四柱八字研究者，精通《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法。你擅长根据八字命理提供精准的穿搭和颜色推荐。'
  let aiResponse: string
  
  switch (provider) {
    case 'deepseek':
      aiResponse = await callDeepSeekAPI(prompt, apiKey, baseURL, systemMessage)
      break
    case 'doubao':
      aiResponse = await callDoubaoAPI(prompt, apiKey, baseURL, systemMessage)
      break
    case 'openai':
      aiResponse = await callOpenAIAPI(prompt, apiKey, baseURL, systemMessage)
      break
    case 'gemini':
      aiResponse = await callGeminiAPI(prompt, apiKey, baseURL, systemMessage)
      break
    default:
      throw new Error(`不支持的API提供商: ${provider}`)
  }
  
  return aiResponse
}

/**
 * 解析穿搭推荐结果
 */
function parseFashionResponse(aiResponse: string): FashionRecommendation {
  try {
    // 尝试提取JSON部分
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      return {
        style: parsed.style || '新中式智能休闲风',
        colors: Array.isArray(parsed.colors) ? parsed.colors : [],
        items: Array.isArray(parsed.items) ? parsed.items : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations : []
      }
    }
  } catch (error) {
    console.error('解析穿搭推荐失败:', error)
  }
  
  // 如果解析失败，返回默认值
  return {
    style: '新中式智能休闲风',
    colors: [],
    items: [],
    locations: []
  }
}

/**
 * 获取AI穿搭推荐
 */
export async function getAIFashionRecommendation(
  request: AIAnalysisRequest
): Promise<FashionRecommendation> {
  const config = getAPIConfig()

  if (!config.apiKey) {
    throw new Error('未配置AI API密钥，请前往设置页面配置API Key')
  }

  const prompt = buildFashionPrompt(request)

  try {
    const aiResponse = await callFashionAPI(prompt, config.provider, config.apiKey, config.baseURL)
    return parseFashionResponse(aiResponse)
  } catch (error) {
    console.error('AI穿搭推荐失败:', error)
    throw error
  }
}

/**
 * 构建人生K线分析的提示词
 */
function buildLifeKlinePrompt(request: AIAnalysisRequest, lifeKlineData: any): string {
  const { bazi, gender, birthDateTime, jobRecommendation, lifeKline } = request
  const baziString = `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`
  
  // 提取关键年龄段的数据
  const keyAges = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const keyDataPoints = keyAges.map(age => {
    const point = lifeKlineData.data.find((d: any) => d.age === age) || lifeKlineData.data[age]
    return point ? `- ${age}岁: 得分${point.score.toFixed(1)}, ${point.description}` : null
  }).filter(Boolean).join('\n')
  
  return `请你以专业四柱八字研究者的身份,结合《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法,对以下人生K线数据进行分析和修正。

【命理信息】
- 性别: ${gender}
- 八字: ${baziString}
- 日主五行: ${jobRecommendation.selfElement}
- 身强身弱: ${jobRecommendation.bodyStrength}
- 起运年龄: ${lifeKline.dayunInfo.startAgeDetail}
- 大运方向: ${lifeKline.dayunInfo.direction}
- 大运序列: ${lifeKline.dayunInfo.dayunList.map(d => `${d.startAge}-${d.endAge}岁: ${d.tianGan}${d.diZhi}`).join('、')}

【当前K线数据】
${keyDataPoints}

【分析要求】
请使用Markdown格式输出分析和修正建议,包括:

### 📊 人生K线整体评价
1. 分析当前K线走势是否合理
2. 指出明显不合理的地方(如:波动过于剧烈、峰值异常等)
3. 评价与八字命理的匹配度

### ⚖️ 基于八字命理的修正建议
1. 根据大运流年五行生克关系,修正各年龄段运势得分
2. 重新评估人生巅峰期的年龄范围
3. 识别关键的转折点和重要节点
4. 分析各运程(10年)的运势特征

### 💡 修正后的关键节点
使用列表形式列出:
- **关键上升期**: 年龄段及原因
- **关键低谷期**: 年龄段及注意事项
- **人生巅峰期**: 修正后的年龄段
- **重要转折点**: 年龄及事件类型

### 📈 修正说明
说明修正的依据和理由,结合:
- 大运与日主的生克关系
- 流年五行对命局的影响
- 刑冲破害等关系
- 十神配置的作用

**输出格式**: 请使用Markdown格式,确保内容结构清晰、逻辑严谨。`
}

/**
 * 构建AI推荐岗位的提示词
 */
function buildJobRecommendationPrompt(request: AIAnalysisRequest): string {
  const { bazi, gender, birthDateTime, jobRecommendation, lifeKline } = request
  const baziString = `${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`
  
  return `请你以专业四柱八字研究者和职业规划专家的身份,结合《渊海子平》《三命通会》《滴天髓》等古籍理论与现代职业发展趋势,为${gender}命(八字:${baziString})提供精准的AI岗位推荐。

【命理信息】
- 日主五行: ${jobRecommendation.selfElement}
- 身强身弱: ${jobRecommendation.bodyStrength}
- 五行得分: 木${jobRecommendation.scores['木']}分、火${jobRecommendation.scores['火']}分、土${jobRecommendation.scores['土']}分、金${jobRecommendation.scores['金']}分、水${jobRecommendation.scores['水']}分
- 当前大运: ${lifeKline.dayunInfo.currentDayun}
- 人生巅峰期: ${lifeKline.peakAge ? `${lifeKline.peakAge.start}-${lifeKline.peakAge.end}岁` : '待定'}

【推荐要求】
请使用Markdown格式输出,包括:

### 💼 AI岗位推荐
根据八字命理特点,推荐3-5个适合的AI相关岗位,每个岗位包含:
- **岗位名称**: 具体职位名称
- **适合原因**: 结合八字五行、性格特点、天赋优势说明为什么适合
- **发展方向**: 该岗位的职业发展路径
- **能力要求**: 需要具备的核心能力

### 🎯 跨行入门建议
针对想要跨行进入AI领域的建议:
- 适合的学习路径
- 需要补充的技能
- 最佳入门时机(结合大运流年)
- 推荐的学习资源或方向

### 📝 简历优化建议
基于八字命理特点,提供简历优化建议:
- 应该突出的优势
- 适合的表述方式
- 需要注意的要点

### 💬 面试准备建议
- 面试中如何展现自己的优势
- 适合的沟通风格
- 需要避免的表现

请确保推荐内容专业、实用,结合八字命理与现代AI行业特点。`
}

/**
 * 获取AI岗位推荐
 */
export async function getAIJobRecommendation(
  request: AIAnalysisRequest
): Promise<string> {
  const config = getAPIConfig()

  if (!config.apiKey) {
    throw new Error('未配置AI API密钥，请前往设置页面配置API Key')
  }

  const prompt = buildJobRecommendationPrompt(request)
  const systemMessage = '你是一位专业的四柱八字研究者和职业规划专家，精通《渊海子平》《三命通会》《滴天髓》等古籍理论，同时也了解现代AI行业发展趋势和岗位要求。'

  try {
    let aiResponse: string
    switch (config.provider) {
      case 'deepseek':
        aiResponse = await callDeepSeekAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      case 'doubao':
        aiResponse = await callDoubaoAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      case 'openai':
        aiResponse = await callOpenAIAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      case 'gemini':
        aiResponse = await callGeminiAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      default:
        throw new Error(`不支持的API提供商: ${config.provider}`)
    }
    return aiResponse
  } catch (error) {
    console.error('AI岗位推荐失败:', error)
    throw error
  }
}

/**
 * 获取AI人生K线分析
 */
export async function getAILifeKlineAnalysis(
  request: AIAnalysisRequest,
  lifeKlineData: any
): Promise<string> {
  const config = getAPIConfig()

  if (!config.apiKey) {
    throw new Error('未配置AI API密钥，请前往设置页面配置API Key')
  }

  const prompt = buildLifeKlinePrompt(request, lifeKlineData)
  const systemMessage = '你是一位专业的四柱八字研究者，精通《渊海子平》《三命通会》《滴天髓》等古籍理论与盲派命理方法。你擅长根据八字大运流年分析人生运势走势。'

  try {
    let aiResponse: string
    switch (config.provider) {
      case 'deepseek':
        aiResponse = await callDeepSeekAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      case 'doubao':
        aiResponse = await callDoubaoAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      case 'openai':
        aiResponse = await callOpenAIAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      case 'gemini':
        aiResponse = await callGeminiAPI(prompt, config.apiKey, config.baseURL, systemMessage)
        break
      default:
        throw new Error(`不支持的API提供商: ${config.provider}`)
    }
    return aiResponse
  } catch (error) {
    console.error('AI人生K线分析失败:', error)
    throw error
  }
}
