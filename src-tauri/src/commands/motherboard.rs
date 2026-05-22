use crate::types::MotherboardInfo;
use smbioslib::table_load_from_device;

pub fn get_motherboard_info() -> MotherboardInfo {
    let mut info = MotherboardInfo {
        manufacturer: String::new(),
        model: String::new(),
        version: String::new(),
    };

    if let Ok(smbios) = table_load_from_device() {
        if let Some(baseboard) =
            smbios.find_map(|b: smbioslib::SMBiosBaseboardInformation| {
                Some((
                    b.manufacturer().to_utf8_lossy().unwrap_or_default(),
                    b.product().to_utf8_lossy().unwrap_or_default(),
                    b.version().to_utf8_lossy().unwrap_or_default(),
                ))
            })
        {
            info.manufacturer = baseboard.0;
            info.model = baseboard.1;
            info.version = baseboard.2;
        }
    }

    info
}
