# 八字排盘系统

一个基于 React + TypeScript 的八字排盘和AI智能分析系统。

## ✨ 功能特性

- 📊 八字排盘：自动计算年、月、日、时四柱
- 📈 人生K线：可视化展示人生运势走势
- 🤖 AI智能分析：基于专业命理理论的AI分析
- 👔 职位推荐：根据八字推荐适合的职业方向
- 👗 穿搭推荐：基于五行属性的颜色和风格推荐
- 🎯 喜用神分析：分析命盘中的喜用神和忌神

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 部署到线上

**推荐使用 Vercel（最简单）：**

1. 将代码推送到 GitHub
2. 访问 https://vercel.com 并登录
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库
5. Vercel 会自动检测配置，直接点击 "Deploy"
6. 等待 1-2 分钟，获得在线链接！

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔑 API Key 配置

使用 AI 功能需要配置 API Key：

1. 在网页上点击右上角的 "API设置" 按钮
2. 选择 API 提供商（DeepSeek、OpenAI、豆包、Gemini）
3. 输入你的 API Key
4. 保存后即可使用 AI 功能

**支持的 API 提供商：**
- DeepSeek（推荐，性价比高）
- OpenAI（GPT-3.5/GPT-4）
- 豆包（字节跳动）
- Gemini（Google）

详细配置说明请查看 [AI_API_SETUP.md](./AI_API_SETUP.md)

## 📦 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图表**: Recharts
- **Markdown**: react-markdown
- **农历计算**: lunar-typescript

## 📝 注意事项

- API Key 存储在浏览器 localStorage，不会上传到服务器
- 基础功能（八字计算、人生K线）无需 API Key
- AI 功能需要用户自己配置 API Key

## 📄 License

MIT
