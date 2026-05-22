use crate::types::GpuDisplay;
use display_info::DisplayInfo;

// SetupDi API for getting device friendly names (what Device Manager uses)
const DIGCF_PRESENT: u32 = 0x02;
const SPDRP_DEVICEDESC: u32 = 0x00;
const SPDRP_FRIENDLYNAME: u32 = 0x0C;

#[repr(C)]
struct SpDevinfoData {
    cb_size: u32,
    class_guid: [u8; 16],
    dev_inst: u32,
    _reserved: usize,
}

#[link(name = "setupapi")]
extern "system" {
    fn SetupDiGetClassDevsW(
        class_guid: *const u8,
        enumerator: *const u16,
        hwnd_parent: usize,
        flags: u32,
    ) -> usize;
    fn SetupDiEnumDeviceInfo(
        device_info_set: usize,
        member_index: u32,
        device_info_data: *mut SpDevinfoData,
    ) -> i32;
    fn SetupDiGetDeviceRegistryPropertyW(
        device_info_set: usize,
        device_info_data: *const SpDevinfoData,
        property: u32,
        property_reg_data_type: *mut u32,
        property_buffer: *mut u8,
        property_buffer_size: u32,
        required_size: *mut u32,
    ) -> i32;
    fn SetupDiDestroyDeviceInfoList(device_info_set: usize) -> i32;
}

// Monitor class GUID: {4d36e96e-e325-11ce-bfc1-08002be10318}
const MONITOR_CLASS_GUID: [u8; 16] = [
    0x6E, 0xE9, 0x36, 0x4D, 0x25, 0xE3, 0xCE, 0x11,
    0xBF, 0xC1, 0x08, 0x00, 0x2B, 0xE1, 0x03, 0x18,
];

fn utf16_to_string(buf: &[u8]) -> String {
    let u16_buf: Vec<u16> = buf
        .chunks_exact(2)
        .map(|c| u16::from_ne_bytes([c[0], c[1]]))
        .take_while(|&c| c != 0)
        .collect();
    String::from_utf16_lossy(&u16_buf)
}

/// Get monitor friendly names using SetupDi API (same as Device Manager).
/// Tries SPDRP_FRIENDLYNAME first (e.g. "Mi Monitor"),
/// falls back to SPDRP_DEVICEDESC (e.g. "Generic Monitor").
fn get_monitor_names() -> Vec<String> {
    let hdev = unsafe {
        SetupDiGetClassDevsW(
            MONITOR_CLASS_GUID.as_ptr(),
            std::ptr::null(),
            0,
            DIGCF_PRESENT,
        )
    };
    if hdev == usize::MAX {
        return Vec::new();
    }

    let mut monitors = Vec::new();
    let mut idx: u32 = 0;
    loop {
        let mut devinfo = SpDevinfoData {
            cb_size: std::mem::size_of::<SpDevinfoData>() as u32,
            class_guid: [0; 16],
            dev_inst: 0,
            _reserved: 0,
        };
        if unsafe { SetupDiEnumDeviceInfo(hdev, idx, &mut devinfo) } == 0 {
            break;
        }

        let mut buf = [0u8; 512];
        let mut reg_type: u32 = 0;
        let mut needed: u32 = 0;

        // Try friendly name first (more descriptive, e.g. "Mi Monitor")
        let ok = unsafe {
            SetupDiGetDeviceRegistryPropertyW(
                hdev,
                &devinfo,
                SPDRP_FRIENDLYNAME,
                &mut reg_type,
                buf.as_mut_ptr(),
                buf.len() as u32,
                &mut needed,
            )
        };
        let name = if ok != 0 {
            utf16_to_string(&buf)
        } else {
            // Fall back to device description
            buf = [0u8; 512];
            let ok2 = unsafe {
                SetupDiGetDeviceRegistryPropertyW(
                    hdev,
                    &devinfo,
                    SPDRP_DEVICEDESC,
                    &mut reg_type,
                    buf.as_mut_ptr(),
                    buf.len() as u32,
                    &mut needed,
                )
            };
            if ok2 != 0 {
                utf16_to_string(&buf)
            } else {
                String::new()
            }
        };

        if !name.is_empty() {
            monitors.push(name);
        }
        idx += 1;
    }

    unsafe { SetupDiDestroyDeviceInfoList(hdev) };
    monitors
}

pub fn get_displays() -> Vec<GpuDisplay> {
    let monitor_names = get_monitor_names();

    match DisplayInfo::all() {
        Ok(displays) => displays
            .iter()
            .enumerate()
            .map(|(i, d)| {
                let wmi_model = monitor_names.get(i).cloned().filter(|s| !s.is_empty());

                let model = wmi_model
                    .clone()
                    .unwrap_or_else(|| format!("Display {}", i + 1));

                let monitor_name = wmi_model.unwrap_or_else(|| {
                    if d.name.is_empty() {
                        format!("Monitor {}", i + 1)
                    } else {
                        d.name.clone()
                    }
                });

                GpuDisplay {
                    model,
                    vendor: String::new(),
                    resolution_x: d.width,
                    resolution_y: d.height,
                    current_refresh_rate: d.frequency as f64,
                    monitor_name,
                }
            })
            .collect(),
        Err(_) => Vec::new(),
    }
}
