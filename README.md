# SysToolkit

系统监控与工具箱 — 桌面端系统信息查看 + 实用工具集

## 功能

### 系统信息
- **CPU**：型号、厂商、核心/线程数、频率、实时使用率
- **内存**：总量、已用、可用、使用率、虚拟内存、内存条型号/频率/类型
- **显卡**：型号、厂商、显存、驱动版本
- **显示器**：型号、分辨率、刷新率（支持多显示器，通过 SetupDi API 获取真实名称）
- **磁盘**：物理硬盘型号（如 WD Blue SN580 1TB）、分区使用情况
- **主板**：制造商、型号、版本
- **操作系统**：发行版、版本号、内核、架构、主机名、运行时间
- **网络**：网卡名称、IPv4、MAC、速度、实时速率、累计流量

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
| 后端 | Rust (Tauri 2) + sysinfo + nvml-wrapper + smbios-lib + netdev |
| 桌面端 | Tauri 2.11 (WebView2, ~5MB 安装包) |

## 开发

```bash
# 安装依赖
npm install

# Tauri 开发模式（前端热重载 + Rust 后端）
npm run dev:tauri
```

## 构建

```bash
# 构建 Windows 桌面应用
npx tauri build
# 产物在 src-tauri/target/release/bundle/
#   msi/SysToolkit_1.0.0_x64_en-US.msi
#   nsis/SysToolkit_1.0.0_x64-setup.exe
```

## 项目结构

```
sys-toolkit/
├── src-tauri/              # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── commands/       # 系统信息采集模块
│   │   │   ├── cpu.rs      # CPU 信息
│   │   │   ├── memory.rs   # 内存 + DIMM 信息 (SMBIOS)
│   │   │   ├── gpu.rs      # 显卡信息 (NVML)
│   │   │   ├── display.rs  # 显示器信息 (SetupDi API)
│   │   │   ├── disk.rs     # 磁盘信息 (sysinfo + PowerShell)
│   │   │   ├── motherboard.rs  # 主板信息 (SMBIOS)
│   │   │   ├── os.rs       # 操作系统信息 (注册表)
│   │   │   └── network.rs  # 网络信息 (netdev + sysinfo)
│   │   ├── types.rs        # 数据结构定义
│   │   ├── lib.rs          # Tauri 命令注册
│   │   └── main.rs         # 入口
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
├── src/                    # React 前端
│   ├── components/         # 通用组件
│   ├── pages/              # 页面（仪表盘、系统信息、计时器）
│   ├── stores/             # Zustand 状态管理
│   ├── styles/             # 全局样式 + 主题
│   ├── types/              # TypeScript 类型
│   └── utils/              # 工具函数
└── package.json
```

## 历史版本

| 版本 | 架构 | 说明 |
|------|------|------|
| v1.0.0 | Electron + Node.js + Express | 初始版本，`git checkout v1.0.0-electron` |
| v2.0.0 | Tauri 2 + Rust | Rust 后端重写，安装包 ~5MB（原 Electron ~200MB） |

## 许可

MIT
