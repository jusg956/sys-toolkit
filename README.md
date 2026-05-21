# SysToolkit

系统监控与工具箱 — 桌面端系统信息查看 + 实用工具集

## 功能

### 系统信息
- **CPU**：型号、厂商、核心/线程数、频率、实时使用率
- **内存**：总量、已用、可用、使用率、虚拟内存
- **显卡**：型号、厂商、显存、驱动版本
- **显示器**：型号、分辨率、刷新率（支持多显示器）
- **磁盘**：物理硬盘型号、接口类型、分区使用情况
- **主板**：制造商、型号、版本
- **操作系统**：发行版、版本、内核、架构、主机名、运行时间
- **网络**：网卡名称、IPv4、MAC、速度、DHCP、实时速率、累计流量

### 实时刷新
- CPU 使用率、内存使用率、网络速率每 2 秒自动更新
- 类似 Windows 任务管理器的实时监控体验

### 计时器
- **倒计时**：设定分钟数，支持暂停/继续/重置
- **秒表**：毫秒精度，支持计圈记录，显示每圈时间差

### 导出与复制
- 每个信息卡片带复制按钮，一键复制到剪贴板
- 一键导出全部系统信息为 `.xlsx` 表格

### 界面
- Control Room HUD 暗色主题
- JetBrains Mono 数据字体 + DM Sans UI 字体
- 环形进度条、玻璃拟态卡片、发光进度条

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 + TypeScript + Vite + Ant Design 5 + Zustand |
| 后端 | Node.js + Express + systeminformation |
| 桌面端 | Electron 35 |
| 打包 | electron-builder |

## 开发

```bash
# 安装依赖
npm install

# 网页版开发（前端 + 后端热重载）
npm run dev
# 访问 http://localhost:5173

# Electron 开发模式
npm run dev:electron
```

## 构建

```bash
# 构建前端 + 后端 + Electron 主进程
npm run build

# 打包为 Windows 桌面应用
npm run build:app
# 产物在 release/win-unpacked/SysToolkit.exe
```

## 项目结构

```
sys-toolkit/
├── electron/           # Electron 主进程
│   ├── main.ts         # 窗口管理 + 后端子进程
│   └── preload.ts      # 预加载脚本
├── server/             # Express 后端
│   └── index.ts        # API 端点
├── src/                # React 前端
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── stores/         # Zustand 状态管理
│   ├── styles/         # 全局样式 + 主题
│   ├── types/          # TypeScript 类型
│   └── utils/          # 工具函数
├── esbuild.backend.mjs # 后端打包配置
└── package.json
```

## API 端点

| 端点 | 说明 | 缓存 |
|------|------|------|
| `GET /api/snapshot` | 全量系统信息 | 5s |
| `GET /api/live` | 动态数据（CPU/内存/网络/磁盘/运行时间） | 1.5s |

## 许可

MIT
