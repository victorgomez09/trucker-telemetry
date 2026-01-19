#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::ffi::CString;
use winapi::um::handleapi::CloseHandle;
use winapi::um::memoryapi::{MapViewOfFile, UnmapViewOfFile, FILE_MAP_READ};
use winapi::um::winbase::OpenFileMappingA;

// --- ESTRUCTURAS BINARIAS (COPIA EXACTA DE TU PLUGIN C++) ---
#[repr(C, packed)]
struct GameplayEvent {
    type_id: i32,
    value: i64,
    text: [u8; 128],
    timestamp: u64,
}

#[derive(Serialize, Deserialize, Clone)]
struct GameplayEventDto {
    type_id: i32,
    value: i64,
    text: String,
    timestamp: u64,
}

#[repr(C, packed)]
struct Ets2Data {
    pub speed: f32,
    pub rpm: f32,
    pub gear: i32,
    pub fuel_amount: f32,
    pub fuel_consumption: f32,
    pub fuel_capacity: f32,
    pub fuel_warning_factor: f32,
    pub cargo_damage: f32,
    pub cargo_mass: f32,
    pub job_xp: u32,
    pub job_income: u64,
    pub planned_distance: i32,
    pub navigation_distance: f32,
    pub odometer: f32,           // <--- Nuevo campo
    pub job_start_odometer: f32, // <--- Nuevo campo
    pub truck_km: f32,           // <--- Nuevo campo
    pub city_source: [u8; 64],
    pub city_destination: [u8; 64],
    pub company_source: [u8; 64],
    pub company_destination: [u8; 64],
    pub cargo_name: [u8; 64],
    pub truck_name: [u8; 64],
    pub total_fuel_liters: f32,
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

// --- DTO COMPLETO PARA EL FRONTEND ---
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct TelemetryResponse {
    speed: f32,
    rpm: f32,
    gear: i32,
    truck_name: String,
    odometer: f32,           // Enviado a Angular
    job_start_odometer: f32, // Enviado a Angular
    truck_km: f32,           // Enviado a Angular
    fuel_amount: f32,
    fuel_capacity: f32,
    fuel_consumption: f32,
    total_fuel_liters: f32,
    job_income: u64,
    job_xp: u32,
    planned_distance: i32,
    navigation_distance: f32,
    city_source: String,
    city_destination: String,
    company_source: String,
    company_destination: String,
    cargo_name: String,
    cargo_mass: f32,
    cargo_damage: f32,
    job_finished: bool,
    speed_limit: f32,
    coords: [f32; 3],
    is_cheater: bool,
    event_count: i32,
    has_job: bool,
    events: Vec<GameplayEventDto>,
}

#[tauri::command]
fn get_telemetry() -> Result<TelemetryResponse, String> {
    unsafe {
        let name = CString::new("ETS2_RUST_SHMEM").unwrap();
        let h_map_file = OpenFileMappingA(FILE_MAP_READ, 0, name.as_ptr());

        if h_map_file.is_null() {
            return Err("JUEGO_NO_DETECTADO".into());
        }

        let p_buf = MapViewOfFile(
            h_map_file,
            FILE_MAP_READ,
            0,
            0,
            std::mem::size_of::<Ets2Data>(),
        );
        if p_buf.is_null() {
            CloseHandle(h_map_file);
            return Err("ERROR_MAPEADO".into());
        }

        let data = &*(p_buf as *const Ets2Data);

        let clean_str = |bytes: &[u8]| {
            String::from_utf8_lossy(bytes)
                .trim_matches(char::from(0))
                .to_string()
        };

        let mut event_list = Vec::new();
        let safe_count = data.event_count.clamp(0, 128) as usize;
        for i in 0..safe_count {
            let ev = &data.events[i];
            event_list.push(GameplayEventDto {
                type_id: ev.type_id,
                value: ev.value,
                text: clean_str(&ev.text),
                timestamp: ev.timestamp,
            });
        }

        // Un trabajo es válido si tiene destino Y distancia planificada
        let has_job = !clean_str(&data.city_destination).is_empty() && data.planned_distance > 0;

        let response = TelemetryResponse {
            speed: data.speed,
            rpm: data.rpm,
            gear: data.gear,
            truck_name: clean_str(&data.truck_name),
            odometer: data.odometer,
            job_start_odometer: data.job_start_odometer,
            truck_km: data.truck_km,
            fuel_amount: data.fuel_amount,
            fuel_capacity: data.fuel_capacity,
            fuel_consumption: data.fuel_consumption,
            total_fuel_liters: data.total_fuel_liters,
            job_income: data.job_income,
            job_xp: data.job_xp,
            planned_distance: data.planned_distance,
            navigation_distance: data.navigation_distance,
            city_source: clean_str(&data.city_source),
            city_destination: clean_str(&data.city_destination),
            company_source: clean_str(&data.company_source),
            company_destination: clean_str(&data.company_destination),
            cargo_name: clean_str(&data.cargo_name),
            cargo_mass: data.cargo_mass,
            cargo_damage: data.cargo_damage,
            job_finished: data.job_finished == 1,
            speed_limit: data.speed_limit,
            coords: [data.x, data.y, data.z],
            is_cheater: data.is_cheater == 1,
            event_count: data.event_count,
            has_job: has_job,
            events: event_list,
        };

        UnmapViewOfFile(p_buf);
        CloseHandle(h_map_file);

        Ok(response)
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_telemetry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
