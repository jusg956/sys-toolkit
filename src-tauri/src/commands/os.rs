use crate::types::OsInfo;
use sysinfo::System;
use winreg::enums::*;
use winreg::RegKey;

fn is_chinese_locale() -> bool {
    // Check system language via NLS registry key
    // 0804 = zh-CN, 0404 = zh-TW, 0409 = en-US
    RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags(
            r"SYSTEM\CurrentControlSet\Control\Nls\Language",
            KEY_READ,
        )
        .and_then(|k| k.get_value::<String, _>("Default"))
        .map(|s| s.starts_with("08") || s.starts_with("0404"))
        .unwrap_or(false)
}

fn edition_id_to_display(edition_id: &str, chinese: bool) -> String {
    if chinese {
        match edition_id {
            "Professional" => "专业版".to_string(),
            "Core" => "家庭版".to_string(),
            "Enterprise" => "企业版".to_string(),
            "Education" => "教育版".to_string(),
            "CoreSingleLanguage" => "家庭中文版".to_string(),
            "CoreN" => "家庭版 N".to_string(),
            "ProfessionalN" => "专业版 N".to_string(),
            _ => edition_id.to_string(),
        }
    } else {
        match edition_id {
            "Professional" => "Pro".to_string(),
            "Core" => "Home".to_string(),
            "Enterprise" => "Enterprise".to_string(),
            "Education" => "Education".to_string(),
            _ => edition_id.to_string(),
        }
    }
}

fn normalize_arch(arch: &str) -> &str {
    match arch {
        "x86_64" => "x64",
        "aarch64" => "arm64",
        _ => arch,
    }
}

pub fn get_os_info(_sys: &System) -> OsInfo {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let Ok(key) = hklm.open_subkey_with_flags(
        r"SOFTWARE\Microsoft\Windows NT\CurrentVersion",
        KEY_READ,
    ) else {
        return OsInfo {
            platform: "Windows".to_string(),
            distro: System::name().unwrap_or_else(|| "Windows".to_string()),
            release: System::os_version().unwrap_or_default(),
            kernel: System::kernel_version().unwrap_or_default(),
            arch: normalize_arch(std::env::consts::ARCH).to_string(),
            hostname: System::host_name().unwrap_or_default(),
            uptime: System::uptime() as f64,
        };
    };

    let current_build: u32 = key
        .get_value::<String, _>("CurrentBuild")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    let is_win11 = current_build >= 22000;
    let version_num = if is_win11 { 11 } else { 10 };

    let edition_id: String = key
        .get_value("EditionID")
        .unwrap_or_else(|_| "Professional".to_string());

    let chinese = is_chinese_locale();
    let edition = edition_id_to_display(&edition_id, chinese);

    let display_version: String = key
        .get_value("DisplayVersion")
        .unwrap_or_default();

    let ubr: u32 = key.get_value("UBR").unwrap_or(0);

    let build_str = if ubr > 0 {
        format!("{}.{}", current_build, ubr)
    } else {
        current_build.to_string()
    };

    let distro = if display_version.is_empty() {
        format!("Windows {} {} ({})", version_num, edition, build_str)
    } else {
        format!(
            "Windows {} {} {} ({})",
            version_num, edition, display_version, build_str
        )
    };

    OsInfo {
        platform: "Windows".to_string(),
        distro,
        release: System::os_version().unwrap_or_default(),
        kernel: System::kernel_version().unwrap_or_default(),
        arch: normalize_arch(std::env::consts::ARCH).to_string(),
        hostname: System::host_name().unwrap_or_default(),
        uptime: System::uptime() as f64,
    }
}
