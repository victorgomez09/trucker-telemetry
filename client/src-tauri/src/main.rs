#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{command, Manager};
use ets2_telemetry_plugin::telemetry::TelemetryData;
use shared_memory::Shmem;
use bincode;
use serde_json;
use std::thread;
use std::time::Duration;

const SHMEM_NAME: &str = "ETS2_FULL_TELEMETRY";

#[command]
fn read_telemetry() -> String {
    let shmem = Shmem::open_existing(SHMEM_NAME).expect("Cannot open shared memory");
    let slice = unsafe { shmem.as_slice() };
    let data: TelemetryData = bincode::deserialize(slice).unwrap();
    serde_json::to_string(&data).unwrap()
}

#[command]
fn get_config() -> AppConfig {
    AppConfig::load()
}

#[command]
fn save_config(config: AppConfig) -> Result<(), String> {
    config.save()
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            // Thread que envía eventos push a Angular
            thread::spawn(move || {
                loop {
                    if let Ok(shmem) = Shmem::open_existing(SHMEM_NAME) {
                        let slice = unsafe { shmem.as_slice() };
                        if let Ok(data) = bincode::deserialize::<TelemetryData>(slice) {
                            let json = serde_json::to_string(&data).unwrap();
                            let _ = app_handle.emit_all("telemetry:update", json);
                        }
                    }
                    thread::sleep(Duration::from_millis(100)); // 10Hz
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![read_telemetry, get_config, save_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
