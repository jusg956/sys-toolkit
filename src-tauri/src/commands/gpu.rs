use crate::types::{GpuController, GpuInfo};
use nvml_wrapper::Nvml;

pub fn get_gpu_info() -> GpuInfo {
    let mut controllers = Vec::new();

    if let Ok(nvml) = Nvml::init() {
        if let Ok(count) = nvml.device_count() {
            for i in 0..count {
                if let Ok(device) = nvml.device_by_index(i) {
                    let model = device.name().unwrap_or_else(|_| "Unknown GPU".to_string());
                    let vram = device
                        .memory_info()
                        .map(|m| m.total)
                        .unwrap_or(0);
                    let driver = nvml.sys_driver_version().unwrap_or_default();

                    controllers.push(GpuController {
                        model,
                        vendor: "NVIDIA".to_string(),
                        vram,
                        driver_version: driver,
                    });
                }
            }
        }
    }

    GpuInfo {
        controllers,
        displays: Vec::new(), // filled by display.rs
    }
}
