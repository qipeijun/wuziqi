# 五子棋游戏 (Gomoku Game)

一个使用 React + TypeScript 开发的现代化五子棋游戏，支持人机对战和双人对战模式，配有精美的UI界面、音效和动画效果。

## 功能特性

- **多种游戏模式**
  - 双人对战模式（PvP）
  - 人机对战模式（PvE）
  - 多种AI难度选择（简单/中等/困难）

- **精美的用户界面**
  - 流畅的棋子落子动画
  - 实时游戏信息显示
  - 悔棋功能
  - 游戏结果展示

- **交互体验**
  - 键盘快捷键支持
  - 落子音效
  - AI思考状态提示
  - 响应式设计

- **技术特性**
  - TypeScript 类型安全
  - Zustand 状态管理
  - Framer Motion 动画效果
  - IndexedDB 本地存储
  - Sass 样式管理

## 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **动画库**: Framer Motion
- **音效处理**: Howler.js
- **本地存储**: IndexedDB (idb)
- **样式**: Sass/SCSS

## 快速开始

### 环境要求

- Node.js >= 14
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd 五子棋

# 安装依赖
npm install
```

### 运行开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录下。

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/       # React 组件
│   ├── Board/       # 棋盘组件
│   ├── GameInfo/    # 游戏信息组件
│   ├── GameMenu/    # 游戏菜单组件
│   └── GameResult/  # 游戏结果组件
├── core/            # 核心游戏逻辑
├── hooks/           # 自定义 React Hooks
├── store/           # Zustand 状态管理
├── styles/          # 全局样式
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
├── App.tsx          # 主应用组件
└── main.tsx         # 应用入口
```

## 游戏规则

五子棋是一种两人对弈的策略棋类游戏：

1. 游戏在 15x15 的棋盘上进行
2. 黑子先行，黑白双方轮流落子
3. 率先在横、竖、斜任意方向形成连续五子者获胜
4. 如果棋盘下满仍未分出胜负，则为平局

## 开发

### 代码规范

项目使用 TypeScript 进行类型检查，确保代码质量。

### 主要依赖版本

- React: ^18.2.0
- TypeScript: ^5.2.2
- Vite: ^5.0.8
- Zustand: ^4.4.7
- Framer Motion: ^10.16.16

## 许可证

MIT

## 作者

开发者: qipeijun

---

欢迎提交 Issue 和 Pull Request！