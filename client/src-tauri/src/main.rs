#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;
use serde::{Deserialize, Serialize};
use shared_memory::ShmemConf;

const SHMEM_NAME: &str = "ETS2_RUST_SHMEM";

#[repr(C, packed)]
#[derive(Clone, Copy)]
pub struct GameplayEvent {
    pub event_type: i32,
    pub value: i64,
    pub text: [u8; 128],
    pub timestamp: u64,
}

#[repr(C, packed)]
#[derive(Clone, Copy)]
pub struct Ets2DataRaw {
    pub speed: f32,
    pub rpm: f32,
    pub gear: i32,
    pub fuel_consumption: f32,
    pub cargo_damage: f32,
    pub cargo_weight: f32,
    pub job_income: u64,
    pub planned_distance: i32,
    pub navigation_distance: f32,
    pub city_source: [u8; 64],
    pub city_destination: [u8; 64],
    pub company_source: [u8; 64],
    pub company_destination: [u8; 64],
    pub cargo_name: [u8; 64],
    pub truck_name: [u8; 64],
    pub last_refuel_amount: f32,
    pub last_refuel_cost: f32,
    pub refuel_event_triggered: i32,
    pub event_count: i32,
    pub next_event_index: i32,
    pub events: [GameplayEvent; 128],
    pub job_finished: i32,
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub speed_limit: f32,
    pub is_cheater: i32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FrontendEvent {
    pub event_type: i32,
    pub value: i64,
    pub text: String,
    pub timestamp: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Ets2FrontendData {
    pub speed: f32,
    pub rpm: f32,
    pub gear: i32,
    pub fuel_consumption: f32,
    pub cargo_damage: f32,
    pub cargo_name: String,
    pub truck_name: String,
    pub city_source: String,
    pub city_destination: String,
    pub planned_distance: i32,
    pub navigation_distance: f32,
    pub job_income: u64,
    pub has_active_job: bool,
    pub job_finished: i32,
    pub status_message: String,
    pub events: Vec<FrontendEvent>,
}

#[tauri::command]
fn read_telemetry() -> Result<Ets2FrontendData, String> {
    let shm = ShmemConf::new()
        .os_id(SHMEM_NAME)
        .open()
        .or_else(|_| {
            ShmemConf::new()
                .os_id(&format!("Global\\{}", SHMEM_NAME))
                .open()
        })
        .map_err(|_| "Sin conexión con ETS2".to_string())?;

    unsafe {
        let raw = &*(shm.as_ptr() as *const Ets2DataRaw);

        // FUNCIÓN DE PARSEO MEJORADA
        // Limpia los nulos y caracteres basura después del primer nulo
        let parse_str = |b: &[u8]| {
            let bytes = b.split(|&x| x == 0).next().unwrap_or(&[]);
            String::from_utf8_lossy(bytes).to_string()
        };

        // Procesar eventos
        let mut events_vec = Vec::new();
        let safe_event_count = raw.event_count.clamp(0, 128) as usize;
        for i in 0..safe_event_count {
            let ev = raw.events[i];
            events_vec.push(FrontendEvent {
                event_type: ev.event_type,
                value: ev.value,
                text: parse_str(&ev.text),
                timestamp: ev.timestamp,
            });
        }
        events_vec.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        let city_dest = parse_str(&raw.city_destination);
        let city_src = parse_str(&raw.city_source);

        // Un trabajo es válido si tiene destino Y distancia planificada
        let has_job = !city_dest.is_empty() && raw.planned_distance > 0;

        let status_msg = if has_job {
            format!("En ruta a {}", city_dest)
        } else {
            match events_vec.first() {
                Some(e) if e.event_type == 2 => "¡Trabajo completado!".into(),
                _ => "Esperando carga...".into(),
            }
        };

        Ok(Ets2FrontendData {
            speed: raw.speed,
            rpm: raw.rpm,
            gear: raw.gear,
            fuel_consumption: raw.fuel_consumption,
            navigation_distance: raw.navigation_distance,
            cargo_damage: raw.cargo_damage,
            truck_name: parse_str(&raw.truck_name),
            city_destination: city_dest,
            city_source: city_src,
            cargo_name: parse_str(&raw.cargo_name),
            has_active_job: has_job,
            planned_distance: raw.planned_distance,
            job_finished: raw.job_finished,
            job_income: raw.job_income,
            status_message: status_msg,
            events: events_vec,
        })
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_telemetry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
