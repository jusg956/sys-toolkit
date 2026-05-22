use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuInfo {
    pub brand: String,
    pub manufacturer: String,
    pub vendor: String,
    pub family: String,
    pub model: String,
    pub speed: f64,
    pub cores: u32,
    pub physical_cores: u32,
    pub processors: u32,
    pub usage: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DimmModule {
    pub locator: String,
    pub manufacturer: String,
    pub part_number: String,
    pub size: u64,
    pub speed: u32,
    pub memory_type: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryInfo {
    pub total: u64,
    pub used: u64,
    pub free: u64,
    pub used_percent: f64,
    pub swap_total: u64,
    pub swap_used: u64,
    pub swap_free: u64,
    pub dimm_modules: Vec<DimmModule>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskLayout {
    pub name: String,
    #[serde(rename = "type")]
    pub disk_type: String,
    pub size: u64,
    pub vendor: String,
    pub interface_type: String,
    pub smart_status: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskPartition {
    pub fs: String,
    #[serde(rename = "type")]
    pub partition_type: String,
    pub size: u64,
    pub used: u64,
    pub available: u64,
    pub used_percent: f64,
    pub mount: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskInfo {
    pub layout: Vec<DiskLayout>,
    pub partitions: Vec<DiskPartition>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuController {
    pub model: String,
    pub vendor: String,
    pub vram: u64,
    pub driver_version: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuDisplay {
    pub model: String,
    pub vendor: String,
    pub resolution_x: u32,
    pub resolution_y: u32,
    pub current_refresh_rate: f64,
    pub monitor_name: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuInfo {
    pub controllers: Vec<GpuController>,
    pub displays: Vec<GpuDisplay>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MotherboardInfo {
    pub manufacturer: String,
    pub model: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OsInfo {
    pub platform: String,
    pub distro: String,
    pub release: String,
    pub kernel: String,
    pub arch: String,
    pub hostname: String,
    pub uptime: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInterface {
    pub iface: String,
    pub iface_name: String,
    pub ip4: String,
    pub ip4subnet: String,
    pub ip6: String,
    pub mac: String,
    #[serde(rename = "type")]
    pub iface_type: String,
    pub speed: u64,
    pub dhcp: bool,
    pub operstate: String,
    pub internal: bool,
    #[serde(rename = "virtual")]
    pub is_virtual: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct NetworkStat {
    pub iface: String,
    pub operstate: String,
    pub rx_bytes: u64,
    pub tx_bytes: u64,
    pub rx_sec: f64,
    pub tx_sec: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInfo {
    pub interfaces: Vec<NetworkInterface>,
    pub stats: Vec<NetworkStat>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemSnapshot {
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub disk: DiskInfo,
    pub gpu: GpuInfo,
    pub motherboard: MotherboardInfo,
    pub os: OsInfo,
    pub network: NetworkInfo,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveCpu {
    pub usage: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveMemory {
    pub total: u64,
    pub used: u64,
    pub free: u64,
    pub used_percent: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveDiskPartition {
    pub mount: String,
    pub size: u64,
    pub used: u64,
    pub available: u64,
    pub used_percent: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveDisk {
    pub partitions: Vec<LiveDiskPartition>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveOs {
    pub uptime: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LiveData {
    pub cpu: LiveCpu,
    pub memory: LiveMemory,
    pub network: NetworkInfo,
    pub disk: LiveDisk,
    pub os: LiveOs,
}
