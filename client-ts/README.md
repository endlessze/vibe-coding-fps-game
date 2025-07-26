# DOOM PROTOCOL - TypeScript Client

🔥 **Hellish Combat Arena** - TypeScript Edition

## ⚡ 开发环境 (Vite)

本项目已迁移到 **Vite** 以获得更好的开发体验！

### 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器 (超快启动!)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 🛠️ 可用命令

- `npm run dev` - 启动 Vite 开发服务器 (推荐)
- `npm run dev:webpack` - 启动 webpack 开发服务器 (备用)
- `npm run build` - Vite 生产构建
- `npm run build:webpack` - webpack 生产构建 (备用)
- `npm run preview` - 预览生产构建
- `npm run test` - 运行测试
- `npm run type-check` - TypeScript 类型检查

### ✨ Vite 优势

- **🚀 极快启动**: ~1-3 秒 vs webpack 的 10-30 秒
- **⚡ 毫秒级热更新**: 文件修改立即反映
- **🎯 按需编译**: 只编译改变的文件
- **📦 更小包体积**: 更好的 Tree Shaking
- **🔧 零配置**: TypeScript 开箱即用

### 🏗️ 项目结构

```
src/
├── core/           # 核心游戏逻辑
├── systems/        # 游戏系统
├── types/          # TypeScript类型定义
├── config/         # 配置文件
├── styles/         # CSS样式
├── main.ts         # 入口文件
└── index.html      # HTML模板
```

### 🔧 故障排除

如果遇到缓存问题，运行：

```bash
./clear-dev-cache.sh
```

### 🎮 游戏特性

- 🎯 FPS 射击游戏机制
- 👾 多种恶魔敌人类型
- 🔫 武器系统
- 🎵 3D 音效
- 📱 响应式 UI 设计
- 🌐 多人游戏支持
