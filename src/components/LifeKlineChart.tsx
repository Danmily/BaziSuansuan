import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { LifeKlineResult } from '../utils/lifeklineCalculator'
import { Star } from 'lucide-react'

interface LifeKlineChartProps {
  data: LifeKlineResult
}

export default function LifeKlineChart({ data }: LifeKlineChartProps) {
  // 为图表准备数据，每5年一个数据点（减少数据量）
  const chartData = data.data
    .filter((item, index) => index % 5 === 0 || index === data.data.length - 1)
    .map(item => ({
      age: item.age,
      score: item.score,
      trend: item.trend
    }))

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const age = payload[0].payload.age
      // 从完整数据中找到对应年龄的数据点
      const dataPoint = data.data.find(d => d.age === age) || data.data[Math.floor(age / 5) * 5] || data.data[0]
      return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold mb-1">{`${dataPoint.age}岁 (${dataPoint.year}年)`}</p>
          <p className="text-yellow-400 mb-1">{`运势得分: ${dataPoint.score}`}</p>
          <p className="text-sm text-gray-300">{dataPoint.description}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-6">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-yellow-400">LIFEKLINE.NET</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-300">上行/爆发</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-300">下行/低谷</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span className="text-gray-300">人生K线</span>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="age"
            stroke="#888"
            label={{ value: '年龄', position: 'insideBottom', offset: -5, style: { fill: '#888' } }}
          />
          <YAxis
            stroke="#888"
            domain={[0, 100]}
            label={{ value: '运势得分', angle: -90, position: 'insideLeft', style: { fill: '#888' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#888' }}
            iconType="line"
          />
          {/* 人生K线 */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="#fbbf24"
            strokeWidth={3}
            dot={false}
            name="人生K线"
            activeDot={{ r: 6 }}
          />
          
          {/* 上行/爆发区域（绿色竖线） */}
          {chartData.map((item, index) => {
            if (item.trend === 'up' && item.score > 50) {
              return (
                <ReferenceLine
                  key={`up-${index}`}
                  x={item.age}
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeOpacity={0.6}
                />
              )
            }
            return null
          })}
          
          {/* 下行/低谷区域（红色竖线） */}
          {chartData.map((item, index) => {
            if (item.trend === 'down' && item.score < 50) {
              return (
                <ReferenceLine
                  key={`down-${index}`}
                  x={item.age}
                  stroke="#ef4444"
                  strokeWidth={3}
                  strokeOpacity={0.6}
                />
              )
            }
            return null
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* 人生巅峰提示 */}
      {data.peakAge && (
        <div className="mt-6 bg-gray-800 border border-yellow-400 rounded-lg p-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">人生巅峰</span>
          </div>
          <p className="text-gray-300">
            预计发生在 <span className="text-yellow-400 font-bold">{data.peakAge.start}-{data.peakAge.end}岁</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            这是您人生中运势最旺盛的时期，事业、财运、感情都将迎来重大突破，请把握机遇！
          </p>
        </div>
      )}
    </div>
  )
}
