#![allow(non_upper_case_globals, non_camel_case_types, dead_code)]

mod logger;

include!(concat!(env!("OUT_DIR"), "/bindings.rs"));

use once_cell::sync::Lazy;
use shared_memory::*;
use std::ffi::{CStr, CString};
use std::os::raw::c_void;
use std::sync::Mutex;

#[repr(C)]
#[derive(Default)]
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

struct SafeShmem(Shmem);
unsafe impl Send for SafeShmem {}
unsafe impl Sync for SafeShmem {}

static SHMEM: Lazy<Mutex<Option<SafeShmem>>> = Lazy::new(|| Mutex::new(None));

const SCS_VALUE_TYPE_float: u32 = 3;
const SCS_VALUE_TYPE_double: u32 = 4;
const SCS_VALUE_TYPE_i32: u32 = 5;
const SCS_U32_NIL: u32 = 0xFFFFFFFF;

// Lista de canales optimizada para ETS2 v1.57
const CHANNELS: &[(&str, u32)] = &[
    ("truck.speed", SCS_VALUE_TYPE_double), // Cambiado a double
    ("truck.engine.rpm", SCS_VALUE_TYPE_double), // Cambiado a double
    ("truck.engine.gear", SCS_VALUE_TYPE_i32),
    ("truck.fuel.amount", SCS_VALUE_TYPE_double),
];

unsafe extern "C" fn telemetry_callback(
    name: scs_string_t,
    _idx: u32,
    value: *const scs_value_t,
    _ctx: *mut c_void,
) {
    logger::log(&format!(
        "Callback received for channel: {:?}",
        CStr::from_ptr(name).to_str().unwrap_or("")
    ));
    if value.is_null() {
        return;
    }
    let val = &*value;
    let channel_name = CStr::from_ptr(name).to_str().unwrap_or("");

    if let Ok(mut guard) = SHMEM.lock() {
        if let Some(safe_shm) = guard.as_mut() {
            let data = &mut *(safe_shm.0.as_ptr() as *mut Ets2Data);

            // Extractor universal: El juego entrega 'val.type' indicando qué envió
            let num = match val.type_ {
                SCS_VALUE_TYPE_float => val.value.float_val as f64,
                SCS_VALUE_TYPE_double => {
                    // Acceso directo a memoria para evitar problemas de nombres de bindgen
                    *((&val.value as *const _) as *const f64)
                }
                SCS_VALUE_TYPE_i32 => val.value.i32_val as f64,
                _ => 0.0,
            };

            match channel_name {
                "truck.speed" => data.speed = num as f32,
                "truck.engine.rpm" => data.rpm = num as f32,
                "truck.engine.gear" => data.gear = num as i32,
                "truck.fuel.amount" => data.fuel = num as f32,
                "navigation.speed.limit" => data.nav_speed_limit = num as f32,
                _ => {}
            }
        }
    }
}

// Helpers para extraer datos sin importar qué tipo decida enviar el juego
unsafe fn extract_f32(val: &scs_value_t) -> f32 {
    match val.type_ {
        3 => val.value.float_val,
        4 => {
            // Acceso seguro al campo double interpretando la memoria de la unión
            let d_ptr = &val.value as *const _ as *const f64;
            *d_ptr as f32
        }
        _ => 0.0,
    }
}

unsafe fn extract_i32(val: &scs_value_t) -> i32 {
    if val.type_ == 5 {
        val.value.i32_val
    } else {
        0
    }
}

unsafe fn extract_u64(val: &scs_value_t) -> u64 {
    if val.type_ == 8 {
        val.value.u64_val
    } else {
        0
    }
}

#[no_mangle]
pub extern "C" fn scs_telemetry_init(
    _version: u32,
    params: *const scs_telemetry_init_params_v101_t,
) -> u32 {
    if params.is_null() {
        return 1;
    }
    let p = unsafe { &*params };

    // --- Inicialización de Memoria Compartida ---
    let shm_id = "ETS2_RUST_SHMEM";
    if let Ok(_) = ShmemConf::new().os_id(shm_id).open() {
        // En Windows, borrar un archivo mapeado suele ser automático cuando el último
        // proceso se cierra, pero vamos a intentar sobreescribir.
    }

    // 2. Creamos con la configuración estándar
    let shm_result = ShmemConf::new()
        .size(std::mem::size_of::<Ets2Data>())
        .os_id(shm_id)
        .create();

    let shm = match shm_result {
        Ok(s) => s,
        Err(_) => {
            // Si falla la creación (porque ya existe), simplemente la abrimos
            ShmemConf::new()
                .os_id(shm_id)
                .open()
                .expect("Fallo crítico al abrir memoria compartida")
        }
    };
    *SHMEM.lock().unwrap() = Some(SafeShmem(shm));

    // --- Registro con Bucle de Compatibilidad ---
    if let Some(reg_fn) = p.register_for_channel {
        let canales = [
            "truck.speed",
            "truck.engine.rpm",
            "truck.engine.gear",
            "truck.fuel.amount",
            "navigation.speed.limit",
        ];

        for name in canales {
            let c_name = CString::new(name).unwrap();
            let mut registrado = false;

            // Probamos tipos en orden de probabilidad para la v1.57
            for &tipo in &[4, 3, 5] {
                // double, float, i32
                let res = unsafe {
                    reg_fn(
                        c_name.as_ptr(),
                        SCS_U32_NIL,
                        tipo,
                        0,
                        Some(telemetry_callback),
                        std::ptr::null_mut(),
                    )
                };
                if res == 0 {
                    logger::log(&format!("Registered channel: {} with type {}", name, tipo));
                    registrado = true;
                    break;
                }
            }
            if !registrado {
                println!("Failed to register: {}", name);
            }
        }
    }
    0 // SCS_RESULT_ok
}

#[no_mangle]
pub extern "C" fn scs_telemetry_shutdown() {
    let mut guard = SHMEM.lock().unwrap();
    *guard = None;
}
