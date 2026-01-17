import { useState, useEffect } from 'react'
import { Key, Save, Eye, EyeOff, X } from 'lucide-react'

type APIProvider = 'deepseek' | 'doubao' | 'openai' | 'gemini'

interface ApiKeyConfig {
  provider: APIProvider
  apiKey: string
  baseURL?: string
}

const API_PROVIDERS: { value: APIProvider; label: string; baseURL?: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1/chat/completions' },
  { value: 'doubao', label: '豆包', baseURL: 'https://ark.cn-beijing.volces.com/api/v3' },
  { value: 'openai', label: 'OpenAI', baseURL: 'https://api.openai.com/v1/chat/completions' },
  { value: 'gemini', label: 'Gemini', baseURL: 'https://generativelanguage.googleapis.com/v1beta' }
]

const STORAGE_KEY = 'bazi_ai_api_config'

export function getApiKeyConfig(): ApiKeyConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('读取API配置失败:', error)
  }
  return null
}

export function saveApiKeyConfig(config: ApiKeyConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('保存API配置失败:', error)
  }
}

interface ApiKeySettingsProps {
  onClose: () => void
  onSaveSuccess?: () => void // API Key保存成功后的回调
}

export default function ApiKeySettings({ onClose, onSaveSuccess }: ApiKeySettingsProps) {
  const [provider, setProvider] = useState<APIProvider>('deepseek')
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    // 加载已保存的配置
    const saved = getApiKeyConfig()
    if (saved) {
      setProvider(saved.provider)
      setApiKey(saved.apiKey)
      setBaseURL(saved.baseURL || '')
    } else {
      // 如果没有保存的配置，使用默认的baseURL
      const defaultProvider = API_PROVIDERS.find(p => p.value === provider)
      if (defaultProvider?.baseURL) {
        setBaseURL(defaultProvider.baseURL)
      }
    }
  }, [])

  useEffect(() => {
    // 当provider改变时，更新默认baseURL
    const selectedProvider = API_PROVIDERS.find(p => p.value === provider)
    if (selectedProvider?.baseURL && !baseURL) {
      setBaseURL(selectedProvider.baseURL)
    }
  }, [provider])

  const handleSave = () => {
    if (!apiKey.trim()) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
      return
    }

    setSaveStatus('saving')
    
    const config: ApiKeyConfig = {
      provider,
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim() || undefined
    }
    
    saveApiKeyConfig(config)
    
    setSaveStatus('success')
    setTimeout(() => {
      setSaveStatus('idle')
      // 触发保存成功回调
      if (onSaveSuccess) {
        onSaveSuccess()
      }
      onClose()
    }, 1500)
  }

  const selectedProviderInfo = API_PROVIDERS.find(p => p.value === provider)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">API 密钥设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* API提供商选择 */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-3">
              选择 AI 服务提供商
            </label>
            <div className="grid grid-cols-2 gap-3">
              {API_PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setProvider(p.value)
                    if (p.baseURL) {
                      setBaseURL(p.baseURL)
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    provider === p.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{p.label}</div>
                  {p.value === 'deepseek' && (
                    <div className="text-xs text-gray-500 mt-1">性价比高，中文友好</div>
                  )}
                  {p.value === 'doubao' && (
                    <div className="text-xs text-gray-500 mt-1">字节跳动，国内可用</div>
                  )}
                  {p.value === 'openai' && (
                    <div className="text-xs text-gray-500 mt-1">ChatGPT，性能优秀</div>
                  )}
                  {p.value === 'gemini' && (
                    <div className="text-xs text-gray-500 mt-1">Google Gemini</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* API Key输入 */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`请输入 ${selectedProviderInfo?.label} 的 API Key`}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Base URL输入（可选） */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Base URL（可选）
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder={selectedProviderInfo?.baseURL || '请输入自定义 API 地址'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              如果使用默认地址，可以留空。自定义代理地址时请填写完整URL
            </p>
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">使用说明</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>API Key 仅存储在本地浏览器，不会上传到服务器</li>
              <li>设置后将在分析八字时自动使用对应的 AI 服务</li>
              <li>不同提供商的价格和性能有所差异，请根据需求选择</li>
              <li>DeepSeek 和豆包对中文支持较好，性价比高</li>
            </ul>
          </div>

          {/* 保存按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving' || saveStatus === 'success'}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                saveStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-50'
              }`}
            >
              {saveStatus === 'saving' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
              {saveStatus === 'success' && '✓ 已保存'}
              {saveStatus === 'error' && '✗ 请输入API Key'}
              {saveStatus === 'idle' && (
                <>
                  <Save className="w-5 h-5" />
                  保存设置
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
