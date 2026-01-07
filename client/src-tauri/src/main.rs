#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;
mod telemetry;

use bincode;
use config::AppConfig;
use serde::Serialize;
use serde_json;
use shared_memory::ShmemConf;
use std::slice;
use std::thread;
use std::time::Duration;
use tauri::command;
use tauri::Emitter;
use telemetry::TelemetryData;

const SHMEM_NAME: &str = "ETS2_RUST_SHMEM";

#[repr(C)]
#[derive(Default, Serialize, Clone, Copy)] // Añadimos Copy para facilitar el clonado
pub struct Ets2Data {
    pub speed: f32,
    pub rpm: f32,
    pub gear: i32,
    pub fuel: f32,
    pub nav_distance: f32,
    pub nav_time: f32,
    pub nav_speed_limit: f32,
    pub job_income: u64,
    pub job_remaining_time: i32,
    pub job_cargo_mass: f32,
}

#[tauri::command]
fn read_telemetry() -> Result<Ets2Data, String> {
    // 1. Intentamos el nombre estándar
    let shm_id = "ETS2_RUST_SHMEM";

    let shm = ShmemConf::new()
        .os_id(shm_id)
        .open()
        .or_else(|_| {
            // 2. Fallback: Intentamos con el prefijo Global (por si el juego escaló privilegios)
            ShmemConf::new()
                .os_id(&format!("Global\\{}", shm_id))
                .open()
        })
        .or_else(|_| {
            // 3. Fallback: Intentamos con el prefijo Local
            ShmemConf::new().os_id(&format!("Local\\{}", shm_id)).open()
        })
        .map_err(|_| "Telemetría no encontrada. ¿Está el camión en marcha?".to_string())?;

    unsafe {
        println!("Shared memory accessed: {}", shm_id);
        println!("Shared memory size: {}", shm.len());
        println!("Shared memory ptr: {:?}", shm.as_ptr());
        let data_ptr = shm.as_ptr() as *const Ets2Data;
        Ok(*data_ptr)
    }
}

#[tauri::command]
fn get_config() -> AppConfig {
    AppConfig::load()
}

#[tauri::command]
fn save_config(config: AppConfig) -> Result<(), String> {
    config.save()
}

fn main() {
    // tauri::Builder::default()
    //     .setup(|app| {
    //         let app_handle = app.handle().clone();
    //         // Thread que envía eventos push a Angular
    //         thread::spawn(move || {
    //             loop {
    //                 if let Ok(shmem) = ShmemConf::new().os_id(SHMEM_NAME).open() {
    //                     println!("Shared memory accessed");
    //                     let ptr = shmem.as_ptr();
    //                     let len = shmem.len();
    //                     let slice: &mut [u8] = unsafe { slice::from_raw_parts_mut(ptr, len) };
    //                     if let Ok(data) = bincode::deserialize::<TelemetryData>(slice) {
    //                         println!("Telemetry data deserialized");
    //                         let json = serde_json::to_string(&data).unwrap();
    //                         println!("Emitting telemetry data: {}", json);
    //                         app_handle.emit("telemetry:update", json).unwrap();
    //                     }
    //                 }
    //                 thread::sleep(Duration::from_millis(100)); // 10Hz
    //             }
    //         });
    //         Ok(())
    //     })
    //     .invoke_handler(tauri::generate_handler![
    //         read_telemetry,
    //         get_config,
    //         save_config
    //     ])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
    tauri::Builder::default()
        // REGISTRO DEL COMANDO
        .invoke_handler(tauri::generate_handler![
            read_telemetry,
            get_config,
            save_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
