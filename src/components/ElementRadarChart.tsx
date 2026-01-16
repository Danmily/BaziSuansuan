import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { FiveElementsScore } from '../utils/baziCalculator'

interface ElementRadarChartProps {
  scores: FiveElementsScore
}

export default function ElementRadarChart({ scores }: ElementRadarChartProps) {
  // 将得分转换为0-100的比例（用于雷达图显示）
  const maxScore = Math.max(...Object.values(scores))
  const normalizedScore = (score: number) => (score / maxScore) * 100

  const data = [
    {
      element: '木',
      score: normalizedScore(scores['木']),
      fullMark: 100
    },
    {
      element: '火',
      score: normalizedScore(scores['火']),
      fullMark: 100
    },
    {
      element: '土',
      score: normalizedScore(scores['土']),
      fullMark: 100
    },
    {
      element: '金',
      score: normalizedScore(scores['金']),
      fullMark: 100
    },
    {
      element: '水',
      score: normalizedScore(scores['水']),
      fullMark: 100
    }
  ]

  // 元素颜色映射
  const elementColors: Record<string, string> = {
    '木': '#10b981', // green
    '火': '#ef4444', // red
    '土': '#f59e0b', // amber
    '金': '#eab308', // yellow
    '水': '#3b82f6' // blue
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="#d1d5db" />
        <PolarAngleAxis 
          dataKey="element" 
          tick={{ fill: '#374151', fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="五行得分"
          dataKey="score"
          stroke="#eab308"
          fill="#eab308"
          fillOpacity={0.4}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
