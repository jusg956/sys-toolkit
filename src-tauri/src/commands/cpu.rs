use crate::types::CpuInfo;
use sysinfo::System;

pub fn get_cpu_info(sys: &System) -> CpuInfo {
    let cpus = sys.cpus();
    let first = cpus.first();
    let physical_cores = System::physical_core_count().unwrap_or(0) as u32;
    let logical_cores = cpus.len() as u32;

    CpuInfo {
        brand: first.map(|c| c.brand().to_string()).unwrap_or_default(),
        manufacturer: first.map(|c| c.vendor_id().to_string()).unwrap_or_default(),
        vendor: first.map(|c| c.vendor_id().to_string()).unwrap_or_default(),
        family: String::new(),
        model: String::new(),
        speed: first.map(|c| c.frequency() as f64 / 1000.0).unwrap_or(0.0),
        cores: logical_cores,
        physical_cores,
        processors: 1,
        usage: sys.global_cpu_usage() as f64,
    }
}
