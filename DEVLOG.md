# 开发日志

## 2026-05-21

### 项目初始化
- 创建项目 `D:\AI_Agent\sys-toolkit`，使用 Vite + React + TypeScript
- 后端使用 Express + `systeminformation` 获取硬件信息
- 初始功能：系统信息查看 + 计时器

### UI 重设计
- 从标准 Ant Design 卡片重构为 "Control Room HUD" 暗色主题
- 设计要素：深色背景 `#080C18`、电青色强调 `#00D4FF`、JetBrains Mono 数据字体
- 60px 图标侧边栏、环形进度条、玻璃拟态卡片

### 第一轮 Bug 修复
- Dashboard grid 不拉伸 → 改为 `repeat(4, 1fr)` + `.grid-4` CSS 类
- 环形进度条文字重叠 → 标签移到环外，字号缩小
- 显示器信息缺失 → 通过 PowerShell WMI 查询 `Win32_PnPEntity`
- 计时器状态重置 → 创建 Zustand store 跨页面持久化
- 刷新慢 → 后端 5s 缓存 + 前端 2s 防抖，移除冗余查询

### 第二轮 Bug 修复
- 磁盘只显示 3 个分区 → 移除 `.slice(0, 3)`
- 系统信息第二行不拉伸 → 添加 `.grid-3` CSS 类
- 显示器厂商乱码 → 移除厂商字段
- 添加网络信息 → 新增 `/api/network` 和 `/api/live` 端点

### 实时刷新 + 复制/导出
- 后端新增 `/api/live` 轻量端点（1.5s 缓存），只返回动态数据
- 前端每 2 秒自动拉取 `/api/live`，合并到 snapshot
- 显示器信息合并到 GPU 卡片内部
- 创建 `CopyButton` 组件，每个卡片添加复制按钮
- 安装 `xlsx` 包，实现一键导出为 `.xlsx`

### 布局优化
- 复制按钮位置统一：CPU/RAM 用 `position: absolute` 定位到卡片右上角
- 多显示器支持：GPU 卡片遍历 `gpu.displays` 显示所有显示器
- 导出改为单工作表，用分隔行区分各板块
- 磁盘卡片增加物理硬盘型号（如 WD Blue SN580 1TB）
- OS+主板 与 GPU 拆分为独立网格，避免卡片高度互相拉伸
- GPU 卡片改为 `auto-fit` 自适应宽度，单卡全宽
- GPU 卡片内容改为左右布局（GPU 信息 + 显示器信息），充分利用宽度

## 2026-05-22

### Electron 桌面端打包
- 安装 `electron` + `electron-builder` + `esbuild`
- 创建 `electron/main.ts`：窗口管理 + 后端子进程启动
- 创建 `electron/preload.ts`：安全上下文桥接
- 后端用 esbuild 打包为 ESM 单文件（`dist-electron/backend/index.mjs`）
- 前端用 Vite 构建到 `dist/`
- Electron 主进程用 tsc 编译，输出重命名为 `.cjs`（解决 `"type": "module"` 冲突）
- 创建 `src/utils/api.ts`，处理 Electron 环境下的 API 地址
- electron-builder 配置：`dir` 目标，`asar` 打包，`systeminformation` 白名单

### GitHub 发布
- 创建仓库 `https://github.com/jusg956/sys-toolkit`
- 代码推送到 `main` 分支
- 更新 README.md，添加完整功能说明和项目结构
- 创建 DEVLOG.md 开发日志
