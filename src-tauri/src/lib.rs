mod commands;
mod types;

use std::sync::Mutex;
use std::time::Instant;
use sysinfo::{Networks, System};
use tauri::State;
use types::{LiveData, SystemSnapshot};

struct AppState {
    sys: Mutex<System>,
    network: Mutex<commands::network::NetworkState>,
}

#[tauri::command]
fn get_snapshot(state: State<AppState>) -> Result<SystemSnapshot, String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    let mut network = state.network.lock().map_err(|e| e.to_string())?;
    sys.refresh_all();

    let cpu_info = commands::cpu::get_cpu_info(&sys);
    let mut gpu_info = commands::gpu::get_gpu_info();
    gpu_info.displays = commands::display::get_displays();

    Ok(SystemSnapshot {
        cpu: cpu_info,
        memory: commands::memory::get_memory_info(&sys),
        disk: commands::disk::get_disk_info(),
        gpu: gpu_info,
        motherboard: commands::motherboard::get_motherboard_info(),
        os: commands::os::get_os_info(&sys),
        network: commands::network::get_network_info(&mut network),
    })
}

#[tauri::command]
fn get_live(state: State<AppState>) -> Result<LiveData, String> {
    let mut sys = state.sys.lock().map_err(|e| e.to_string())?;
    let mut network = state.network.lock().map_err(|e| e.to_string())?;
    sys.refresh_cpu_all();
    sys.refresh_memory();

    let cpu_usage = sys.global_cpu_usage() as f64;
    let disks = sysinfo::Disks::new_with_refreshed_list();
    Ok(LiveData {
        cpu: types::LiveCpu { usage: cpu_usage },
        memory: types::LiveMemory {
            total: sys.total_memory(),
            used: sys.used_memory(),
            free: sys.total_memory().saturating_sub(sys.used_memory()),
            used_percent: if sys.total_memory() > 0 {
                sys.used_memory() as f64 / sys.total_memory() as f64 * 100.0
            } else {
                0.0
            },
        },
        network: commands::network::get_network_info(&mut network),
        disk: types::LiveDisk {
            partitions: disks
                .list()
                .iter()
                .map(|d| {
                    let total = d.total_space();
                    let available = d.available_space();
                    let used = total.saturating_sub(available);
                    types::LiveDiskPartition {
                        mount: d.mount_point().to_string_lossy().to_string(),
                        size: total,
                        used,
                        available,
                        used_percent: if total > 0 {
                            used as f64 / total as f64 * 100.0
                        } else {
                            0.0
                        },
                    }
                })
                .collect(),
        },
        os: types::LiveOs {
            uptime: System::uptime() as f64,
        },
    })
}

#[tauri::command]
fn export_xlsx(path: String, data: String) -> Result<(), String> {
    use std::fs::write;
    // Decode base64 data
    fn base64_decode(input: &str) -> Vec<u8> {
        const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut output = Vec::with_capacity(input.len() * 3 / 4);
        let mut buf: u32 = 0;
        let mut bits: u32 = 0;
        for &byte in input.as_bytes() {
            if byte == b'=' { break; }
            let val = TABLE.iter().position(|&c| c == byte).unwrap_or(0) as u32;
            buf = (buf << 6) | val;
            bits += 6;
            if bits >= 8 {
                bits -= 8;
                output.push((buf >> bits) as u8);
            }
        }
        output
    }
    let bytes = base64_decode(&data);
    write(&path, &bytes).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState {
            sys: Mutex::new(System::new_all()),
            network: Mutex::new(commands::network::NetworkState {
                networks: Networks::new_with_refreshed_list(),
                last_refresh: Instant::now(),
            }),
        })
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_snapshot, get_live, export_xlsx])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
