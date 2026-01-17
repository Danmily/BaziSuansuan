# AI API 配置指南

本项目支持接入多个AI API提供商来进行智能八字分析。

## 支持的API提供商

- **DeepSeek**（推荐，性价比高）
- **OpenAI**（GPT-3.5/GPT-4）
- **自定义API**（兼容OpenAI格式的其他服务）

## 配置步骤

### 1. 创建环境变量文件

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```bash
# AI API密钥（必填）
VITE_AI_API_KEY=your_api_key_here

# AI提供商：deepseek 或 openai（默认：deepseek）
VITE_AI_PROVIDER=deepseek

# 自定义API地址（可选，用于使用代理或自建服务）
# VITE_AI_BASE_URL=https://api.deepseek.com/v1/chat/completions
```

### 2. 获取API密钥

#### DeepSeek API
1. 访问 [DeepSeek官网](https://www.deepseek.com/)
2. 注册账号并登录
3. 进入API管理页面获取API密钥
4. 将密钥填入 `.env` 文件的 `VITE_AI_API_KEY`

#### OpenAI API
1. 访问 [OpenAI官网](https://platform.openai.com/)
2. 注册账号并登录
3. 进入API Keys页面创建新密钥
4. 将密钥填入 `.env` 文件的 `VITE_AI_API_KEY`
5. 设置 `VITE_AI_PROVIDER=openai`

### 3. 重启开发服务器

配置完成后，需要重启开发服务器使环境变量生效：

```bash
npm run dev
```

## 使用说明

1. 配置好API密钥后，在"开始分析"时会自动调用AI进行智能分析
2. AI分析结果会显示在"AI智能分析"标签页中
3. 如果未配置API密钥，会显示配置提示和基础分析结果

## 注意事项

- ⚠️ **安全提示**：`.env` 文件已添加到 `.gitignore`，不会被提交到Git仓库
- 🔒 **API密钥安全**：请勿将API密钥提交到代码仓库或公开分享
- 💰 **费用说明**：使用AI API会产生费用，请注意控制使用量
- 🌐 **网络要求**：需要能够访问对应的API服务地址

## 故障排查

### AI分析失败
1. 检查API密钥是否正确
2. 检查网络连接是否正常
3. 查看浏览器控制台的错误信息
4. 确认API提供商的服务状态

### 环境变量不生效
1. 确认 `.env` 文件在项目根目录
2. 确认变量名以 `VITE_` 开头
3. 重启开发服务器

## 自定义API配置

如果需要使用其他兼容OpenAI格式的API服务：

```env
VITE_AI_API_KEY=your_custom_api_key
VITE_AI_PROVIDER=openai
VITE_AI_BASE_URL=https://your-custom-api.com/v1/chat/completions
```
