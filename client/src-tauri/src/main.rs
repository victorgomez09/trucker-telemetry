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

#[repr(C, packed)]
#[derive(Clone, Copy)]
pub struct GameplayEvent {
    pub type: i32,
    pub value: i64,
    pub description: [u8; 128],
    pub timestamp: u64,
}

#[repr(C, packed)]
#[derive(Clone, Copy)]
pub struct Ets2Data {
    pub speed: f32,
    pub rpm: f32,
    pub gear: i32,
    pub fuel_consumption: f32,

    pub cargo_damage: f32,
    pub cargo_weight: f32,
    pub job_income: u64,
    pub planned_distance: i32,
    pub city_source: [u8; 64],
    pub city_destination: [u8; 64],
    pub company_source: [u8; 64],
    pub company_destination: [u8; 64],
    pub cargo_name: [u8; 64],

    pub event_count: i32,
    pub next_event_index: i32,
    pub events: [GameplayEvent; 128],

    pub has_active_job: bool,
    pub status_message: String,
    pub job_finished: i32
}

impl Default for Ets2Data {
    fn default() -> Self {
        unsafe { std::mem::zeroed() }
    }
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
        let data_ptr = shm.as_ptr() as *const Ets2Data;
        let parse = |b: &[u8]| String::from_utf8_lossy(b).trim_matches(char::from(0)).to_string();

        // Procesar la lista de eventos
        let mut events_vec = Vec::new();
        for i in 0..(*data_ptr).event_count as usize {
            let ev = (*data_ptr).events[i];
            events_vec.push(FrontendEvent {
                event_type: ev.event_type,
                value: ev.value,
                text: parse(&ev.text),
                timestamp: ev.timestamp,
            });
        }
        
        // Opcional: Ordenar por timestamp para que el más nuevo esté arriba
        events_vec.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        let has_job = !d.city_source[0] == 0; // Si la ciudad de origen no está vacía

        // Lógica simple de mensajes basada en el último evento del historial
        let status_msg = if !has_job {
            // Comprobar si el último evento fue una entrega o cancelación
            match d.events.iter().find(|e| e.event_type == 2 || e.event_type == 3) {
                Some(e) if e.event_type == 2 => "¡Trabajo completado con éxito!".to_string(),
                Some(e) if e.event_type == 3 => "Trabajo cancelado".to_string(),
                _ => "No hay trabajo en curso".to_string(),
            }
        } else {
            format!("En ruta a {}", parse(&d.city_destination))
        };

        data_ptr.events = events_vec.try_into().unwrap_or([Default::default(); 128]);
        data_ptr.has_active_job = has_job;
        data_ptr.status_message = status_msg;
        Ok(*data_ptr)
    }
}

#[tauri::command]
fn reset_job_status() -> Result<(), String> {
    let shm = ShmemConf::new().os_id("ETS2_RUST_SHMEM").open().map_err(|e| e.to_string())?;
    unsafe {
        let d = shm.as_ptr() as *mut Ets2Data;
        (*d).job_finished = 0;
        (*d).city_source[0] = 0; // Limpiamos origen para indicar que no hay trabajo
    }
    // Opcional: Borrar el archivo binario de cache aquí también
    Ok(())
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
