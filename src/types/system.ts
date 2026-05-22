export interface CpuInfo {
  brand: string
  manufacturer: string
  vendor: string
  family: string
  model: string
  speed: number
  cores: number
  physicalCores: number
  processors: number
  usage: number
}

export interface DimmModule {
  locator: string
  manufacturer: string
  partNumber: string
  size: number
  speed: number
  memoryType: string
}

export interface MemoryInfo {
  total: number
  used: number
  free: number
  usedPercent: number
  swapTotal: number
  swapUsed: number
  swapFree: number
  dimmModules: DimmModule[]
}

export interface DiskLayout {
  name: string
  type: string
  size: number
  vendor: string
  interfaceType: string
  smartStatus: string
}

export interface DiskPartition {
  fs: string
  type: string
  size: number
  used: number
  available: number
  usedPercent: number
  mount: string
}

export interface DiskInfo {
  layout: DiskLayout[]
  partitions: DiskPartition[]
}

export interface GpuController {
  model: string
  vendor: string
  vram: number
  driverVersion: string
  pciBus: string
}

export interface GpuDisplay {
  model: string
  vendor: string
  resolutionX: number
  resolutionY: number
  currentRefreshRate: number
  monitorName: string
}

export interface GpuInfo {
  controllers: GpuController[]
  displays: GpuDisplay[]
}

export interface MotherboardInfo {
  manufacturer: string
  model: string
  version: string
  serial: string
  assetTag: string
}

export interface OsInfo {
  platform: string
  distro: string
  release: string
  codename: string
  kernel: string
  arch: string
  hostname: string
  fqdn: string
  serial: string
  uuid: string
  uptime: number
}

export interface NetworkInterface {
  iface: string
  ifaceName: string
  ip4: string
  ip4subnet: string
  ip6: string
  mac: string
  internal: boolean
  virtual: boolean
  operstate: string
  type: string
  speed: number
  dhcp: boolean
}

export interface NetworkStat {
  iface: string
  operstate: string
  rx_bytes: number
  tx_bytes: number
  rx_sec: number
  tx_sec: number
}

export interface NetworkInfo {
  interfaces: NetworkInterface[]
  stats: NetworkStat[]
}

export interface SystemSnapshot {
  cpu: CpuInfo
  memory: MemoryInfo
  disk: DiskInfo
  gpu: GpuInfo
  motherboard: MotherboardInfo
  os: OsInfo
  network: NetworkInfo
}
