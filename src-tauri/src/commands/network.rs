use crate::types::{NetworkInfo, NetworkInterface, NetworkStat};
use std::time::Instant;
use sysinfo::Networks;

pub struct NetworkState {
    pub networks: Networks,
    pub last_refresh: Instant,
}

fn iface_type_name(if_type: netdev::interface::types::InterfaceType) -> String {
    use netdev::interface::types::InterfaceType;
    match if_type {
        InterfaceType::Ethernet | InterfaceType::FastEthernetT | InterfaceType::GigabitEthernet => {
            "Ethernet".to_string()
        }
        InterfaceType::Wireless80211 | InterfaceType::PeerToPeerWireless => {
            "Wireless".to_string()
        }
        InterfaceType::Ppp => "PPP".to_string(),
        InterfaceType::Loopback => "Loopback".to_string(),
        InterfaceType::Tunnel => "Tunnel".to_string(),
        InterfaceType::ProprietaryVirtual => "Virtual".to_string(),
        _ => format!("{:?}", if_type),
    }
}

pub fn get_network_info(state: &mut NetworkState) -> NetworkInfo {
    // Calculate time delta since last refresh for accurate per-second rates
    let now = Instant::now();
    let elapsed = state.last_refresh.elapsed().as_secs_f64();
    state.last_refresh = now;

    // Refresh the persistent Networks instance to calculate rate deltas
    state.networks.refresh(true);

    let interfaces: Vec<NetworkInterface> = netdev::get_interfaces()
        .into_iter()
        .map(|iface| {
            let ip4 = iface
                .ipv4
                .iter()
                .map(|addr| addr.addr().to_string())
                .collect::<Vec<_>>()
                .join(", ");

            let ip4subnet = iface
                .ipv4
                .iter()
                .map(|addr| format!("/{}", addr.prefix_len()))
                .collect::<Vec<_>>()
                .join(", ");

            let ip6 = iface
                .ipv6
                .iter()
                .map(|addr| addr.addr().to_string())
                .collect::<Vec<_>>()
                .join(", ");

            let mac = iface
                .mac_addr
                .map(|m| m.to_string())
                .unwrap_or_default();

            // Use friendly_name as iface key (matches sysinfo's HashMap key on Windows)
            // netdev's `name` is a GUID on Windows, which doesn't match sysinfo
            let iface_key = iface
                .friendly_name
                .as_ref()
                .cloned()
                .unwrap_or_else(|| iface.name.clone());

            NetworkInterface {
                iface: iface_key,
                iface_name: iface
                    .description
                    .as_ref()
                    .cloned()
                    .or_else(|| iface.friendly_name.as_ref().cloned())
                    .unwrap_or_else(|| iface.name.clone()),
                ip4,
                ip4subnet,
                ip6,
                mac,
                iface_type: iface_type_name(iface.if_type),
                speed: iface.transmit_speed.unwrap_or(0) / 1_000_000, // bps → Mbps
                dhcp: true,
                operstate: if iface.is_up() {
                    "up".to_string()
                } else {
                    "down".to_string()
                },
                internal: iface.is_loopback(),
                is_virtual: iface.is_tun(),
            }
        })
        .collect();

    let rate_divisor = if elapsed > 0.0 { elapsed } else { 1.0 };
    let stats: Vec<NetworkStat> = state
        .networks
        .iter()
        .map(|(name, data)| NetworkStat {
            iface: name.clone(),
            operstate: "up".to_string(),
            rx_bytes: data.total_received(),
            tx_bytes: data.total_transmitted(),
            rx_sec: data.received() as f64 / rate_divisor,
            tx_sec: data.transmitted() as f64 / rate_divisor,
        })
        .collect();

    NetworkInfo { interfaces, stats }
}
