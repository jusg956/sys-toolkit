use crate::types::{DimmModule, MemoryInfo};
use smbioslib::{table_load_from_device, MemorySize, MemorySpeed};
use sysinfo::System;

fn size_to_bytes(size: Option<MemorySize>) -> u64 {
    match size {
        Some(MemorySize::Megabytes(mb)) => mb as u64 * 1024 * 1024,
        Some(MemorySize::Kilobytes(kb)) => kb as u64 * 1024,
        _ => 0,
    }
}

fn speed_to_mhz(speed: Option<MemorySpeed>) -> u32 {
    match speed {
        Some(MemorySpeed::MTs(mts)) => mts as u32,
        _ => 0,
    }
}

pub fn get_memory_info(sys: &System) -> MemoryInfo {
    let total = sys.total_memory();
    let used = sys.used_memory();
    let free = total.saturating_sub(used);
    let used_percent = if total > 0 {
        used as f64 / total as f64 * 100.0
    } else {
        0.0
    };

    let swap_total = sys.total_swap();
    let swap_used = sys.used_swap();
    let swap_free = swap_total.saturating_sub(swap_used);

    let mut dimm_modules = Vec::new();
    if let Ok(smbios) = table_load_from_device() {
        for device in smbios.collect::<smbioslib::SMBiosMemoryDevice>() {
            let size_bytes = size_to_bytes(device.size());
            if size_bytes == 0 {
                continue;
            }
            let mem_type = device.memory_type();
            let type_str = mem_type
                .as_ref()
                .map(|t| format!("{}", t))
                .unwrap_or_default();
            dimm_modules.push(DimmModule {
                locator: device.device_locator().to_utf8_lossy().unwrap_or_default(),
                manufacturer: device.manufacturer().to_utf8_lossy().unwrap_or_default(),
                part_number: device.part_number().to_utf8_lossy().unwrap_or_default(),
                size: size_bytes,
                speed: speed_to_mhz(device.speed()),
                memory_type: type_str,
            });
        }
    }

    MemoryInfo {
        total,
        used,
        free,
        used_percent,
        swap_total,
        swap_used,
        swap_free,
        dimm_modules,
    }
}
