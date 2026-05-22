use crate::types::{DiskInfo, DiskLayout, DiskPartition};
use std::collections::HashMap;
use std::os::windows::process::CommandExt;
use std::process::Command;
use sysinfo::{DiskKind, Disks};

/// Build a map of drive letter (e.g. "C:") → (physical disk model, disk size in bytes)
/// using PowerShell Get-Disk + Get-Partition.
fn build_drive_info_map() -> HashMap<String, (String, u64)> {
    let ps_script = "Get-Disk | ForEach-Object { $d = $_; Get-Partition -DiskNumber $d.Number \
                     | Where-Object { $_.DriveLetter } | ForEach-Object { \
                     \"$($d.Number)`t$($_.DriveLetter)`t$($d.Model)`t$($d.Size)\" } }";

    let output = match Command::new("powershell.exe")
        .args(["-NoProfile", "-NonInteractive", "-Command", ps_script])
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .output()
    {
        Ok(o) => {
            if !o.status.success() {
                log::error!("PowerShell Get-Disk failed: {}", String::from_utf8_lossy(&o.stderr));
                return HashMap::new();
            }
            String::from_utf8_lossy(&o.stdout).to_string()
        }
        Err(e) => {
            log::error!("Failed to run PowerShell: {:?}", e);
            return HashMap::new();
        }
    };

    let mut result = HashMap::new();
    for line in output.lines() {
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() >= 4 {
            let letter = format!("{}:", parts[1].trim().to_uppercase());
            let model = parts[2].trim().to_string();
            let size: u64 = parts[3].trim().parse().unwrap_or(0);
            if !model.is_empty() {
                result.insert(letter, (model, size));
            }
        }
    }
    result
}

pub fn get_disk_info() -> DiskInfo {
    let drive_map = build_drive_info_map();
    let disks = Disks::new_with_refreshed_list();

    let mut seen_models: Vec<String> = Vec::new();
    let mut layout: Vec<DiskLayout> = Vec::new();
    let mut partitions: Vec<DiskPartition> = Vec::new();

    for d in disks.list() {
        let mount = d.mount_point().to_string_lossy().to_string();
        let drive_letter = mount.trim_end_matches('\\').to_uppercase();
        let letter_key = if drive_letter.len() >= 2 {
            &drive_letter[..2]
        } else {
            &drive_letter
        };

        let disk_type = match d.kind() {
            DiskKind::SSD => "SSD",
            DiskKind::HDD => "HDD",
            DiskKind::Unknown(_) => "Unknown",
        };

        let total = d.total_space();
        let available = d.available_space();
        let used = total.saturating_sub(available);
        let used_percent = if total > 0 {
            used as f64 / total as f64 * 100.0
        } else {
            0.0
        };

        partitions.push(DiskPartition {
            fs: d.file_system().to_string_lossy().to_string(),
            partition_type: format!("{:?}", d.kind()),
            size: total,
            used,
            available,
            used_percent,
            mount: mount.clone(),
        });

        let (model, disk_size) = drive_map
            .get(letter_key)
            .cloned()
            .unwrap_or_else(|| (d.name().to_string_lossy().to_string(), 0));

        if !seen_models.contains(&model) {
            seen_models.push(model.clone());
            layout.push(DiskLayout {
                name: model,
                disk_type: disk_type.to_string(),
                size: if disk_size > 0 { disk_size } else { total },
                vendor: String::new(),
                interface_type: String::new(),
                smart_status: String::new(),
            });
        }
    }

    partitions.sort_by(|a, b| a.mount.cmp(&b.mount));

    DiskInfo { layout, partitions }
}
