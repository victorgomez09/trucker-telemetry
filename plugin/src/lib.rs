#![allow(non_upper_case_globals, non_camel_case_types, dead_code)]

mod logger;

include!(concat!(env!("OUT_DIR"), "/bindings.rs"));

use once_cell::sync::Lazy;
use shared_memory::*;
use smart_default::SmartDefault;
use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_void};
use std::sync::Mutex;

// --- Estructura de Datos para Memoria Compartida ---
#[repr(C)]
#[derive(SmartDefault)]
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
    pub job_active: bool,
    pub job_delivered: bool,
    pub job_cancelled: bool,
    pub cargo_damage: f32,
    pub distance_km: f32,

    #[default([0u8; 64])]
    pub city_source: [u8; 64],
    #[default([0u8; 64])]
    pub city_destination: [u8; 64],
}

struct SafeShmem(Shmem);
unsafe impl Send for SafeShmem {}
unsafe impl Sync for SafeShmem {}

static SHMEM: Lazy<Mutex<Option<SafeShmem>>> = Lazy::new(|| Mutex::new(None));

// --- Constantes del SDK ---
const SCS_VALUE_TYPE_float: u32 = 3;
const SCS_VALUE_TYPE_double: u32 = 4;
const SCS_VALUE_TYPE_i32: u32 = 5;
const SCS_U32_NIL: u32 = 0xFFFFFFFF;

// --- Firmas de funciones del SDK (Ajustadas para transmute) ---
type ScsRegisterForEventFn = unsafe extern "C" fn(
    u32,
    Option<unsafe extern "C" fn(u32, *const c_void, *mut c_void)>,
    *mut c_void,
) -> u32;

type ScsRegisterForChannelFn = unsafe extern "C" fn(
    *const c_char,                                                                // 1. name
    u32,                                                                          // 2. index
    u32,                                                                          // 3. type
    u32,                                                                          // 4. flags
    Option<unsafe extern "C" fn(*const c_char, u32, *const c_void, *mut c_void)>, // 5. callback
    *mut c_void,                                                                  // 6. context
) -> u32;

#[repr(C)]
pub struct scs_named_value_t {
    pub name: *const c_char, // scs_string_t
    pub index: u32,
    pub type_: u32,
    pub value: scs_value_t, // Esta viene de bindings.rs
}

#[repr(C)]
pub struct scs_telemetry_gameplay_event_t {
    pub id: *const c_char, // scs_string_t
    pub attributes: *const scs_named_value_t,
}

// --- Callbacks ---

unsafe extern "C" fn telemetry_callback(
    name: *const c_char,
    _idx: u32,
    value: *const c_void,
    _ctx: *mut c_void,
) {
    // 2. Si el valor es nulo o el nombre es nulo, salimos
    if value.is_null() || name.is_null() {
        return;
    }

    // 3. Convertimos el puntero genérico al tipo real del SDK
    let val = &*(value as *const scs_value_t);

    let channel_name = CStr::from_ptr(name).to_str().unwrap_or("");

    if let Ok(mut guard) = SHMEM.lock() {
        if let Some(safe_shm) = guard.as_mut() {
            let data = &mut *(safe_shm.0.as_ptr() as *mut Ets2Data);

            // El resto de tu lógica de extracción (match val.type_ ...)
            let num = match val.type_ {
                SCS_VALUE_TYPE_float => val.value.float_val as f64,
                SCS_VALUE_TYPE_double => *((&val.value as *const _) as *const f64),
                SCS_VALUE_TYPE_i32 => val.value.i32_val as f64,
                _ => 0.0,
            };

            match channel_name {
                "truck.speed" => data.speed = (num * 3.6) as f32,
                "truck.engine.rpm" => data.rpm = num as f32,
                "truck.engine.gear" => data.gear = num as i32,
                "truck.fuel.amount" => data.fuel = num as f32,
                _ => {}
            }
        }
    }
}

unsafe extern "C" fn gameplay_event_callback(
    _event_code: u32,
    event_info: *const c_void,
    _context: *mut c_void,
) {
    // 1. Solo procesamos si hay información y el evento es de tipo Gameplay (2)
    if event_info.is_null() {
        return;
    }

    // Convertimos el puntero genérico a la estructura de evento del SDK
    let event_data = &*(event_info as *const scs_telemetry_gameplay_event_t);

    if event_data.id.is_null() {
        return;
    }

    let event_id = CStr::from_ptr(event_data.id).to_str().unwrap_or("");
    // logger::log(&format!("Procesando evento: {}", event_id));

    if let Ok(mut guard) = SHMEM.lock() {
        if let Some(safe_shm) = guard.as_mut() {
            let data = &mut *(safe_shm.0.as_ptr() as *mut Ets2Data);

            match event_id {
                "job.started" => {
                    data.job_active = true;
                    data.job_delivered = false;
                    data.job_cancelled = false;
                    logger::log("Trabajo iniciado.");
                }
                "job.delivered" => {
                    data.job_active = false;
                    data.job_delivered = true;

                    // Procesar atributos del envío (dinero, distancia, etc.)
                    process_attributes(event_data.attributes, data);
                    logger::log("Trabajo entregado.");
                }
                "job.cancelled" => {
                    data.job_active = false;
                    data.job_cancelled = true;
                    logger::log("Trabajo cancelado.");
                }
                _ => {}
            }
        }
    }
}

// --- Inicialización Principal ---

#[no_mangle]
pub extern "C" fn scs_telemetry_init(
    version: u32,
    params: *const c_void, // Usamos c_void para navegación manual
) -> u32 {
    logger::log(&format!("Iniciando telemetría v.{}", version));

    if params.is_null() {
        return 1;
    }

    // 1. Configurar Memoria Compartida
    let shm_id = "ETS2_RUST_SHMEM";
    let shm = match ShmemConf::new()
        .size(std::mem::size_of::<Ets2Data>())
        .os_id(shm_id)
        .create()
    {
        Ok(s) => s,
        Err(_) => ShmemConf::new()
            .os_id(shm_id)
            .open()
            .expect("Error al abrir SHMEM"),
    };
    *SHMEM.lock().unwrap() = Some(SafeShmem(shm));

    // 2. Localizar Funciones por Offset (Solución al desalineamiento de 2026)
    // El log nos dijo: Index 3 es Events, Index 5 es Channels
    unsafe {
        let p_ptr = params as *const usize;

        // CAMBIO CLAVE: Ajustamos los índices basados en el error de "unregister"
        // Si el juego decía "unregister", es que estábamos apuntando al índice anterior.

        // Offset 32 bytes (Índice 4) -> register_for_event
        let reg_ev_addr = *p_ptr.add(4);
        // Offset 48 bytes (Índice 6) -> register_for_channel
        let reg_ch_addr = *p_ptr.add(6);

        logger::log(&format!(
            "Intentando registro con nuevos offsets: EV:0x{:X}, CH:0x{:X}",
            reg_ev_addr, reg_ch_addr
        ));

        if reg_ev_addr < 0x100000 {
            logger::log("Error: El puntero sigue siendo inválido. Probando offset alternativo...");
            // Si falla, el motor Prism3D está usando una alineación de 16 bytes (muy rara pero posible en 2026)
        }

        let register_for_event: ScsRegisterForEventFn = std::mem::transmute(reg_ev_addr);
        let register_for_channel: ScsRegisterForChannelFn = std::mem::transmute(reg_ch_addr);

        // 1. Registro de Eventos (SCS_TELEMETRY_EVENT_frame_start = 2)
        let res_ev = register_for_event(2, Some(gameplay_event_callback), std::ptr::null_mut());

        // 2. Registro de Canales
        let speed_name = CString::new("truck.speed").unwrap();
        let res_ch = register_for_channel(
            speed_name.as_ptr(),
            SCS_U32_NIL,
            SCS_VALUE_TYPE_double,
            0,
            Some(telemetry_callback),
            std::ptr::null_mut(),
        );

        logger::log(&format!(
            "Resultados finales - Eventos: {}, Canales: {}",
            res_ev, res_ch
        ));
    }

    logger::log("Plugin inicializado con éxito.");
    0 // SCS_RESULT_ok
}

#[no_mangle]
pub extern "C" fn scs_telemetry_shutdown() {
    if let Ok(mut guard) = SHMEM.lock() {
        *guard = None;
    }
    logger::log("Plugin cerrado.");
}

// HELPERS
unsafe fn extract_u64(val: &scs_value_t) -> u64 {
    // En la v1.5x de 2026, el tipo 8 es u64
    if val.type_ == 8 {
        val.value.u64_val
    } else {
        0
    }
}

unsafe fn extract_f32(val: &scs_value_t) -> f32 {
    match val.type_ {
        3 => val.value.float_val,
        4 => (*(&val.value as *const _ as *const f64)) as f32, // Cast de double a float
        _ => 0.0,
    }
}

unsafe fn process_attributes(mut attr_ptr: *const scs_named_value_t, data: &mut Ets2Data) {
    if attr_ptr.is_null() {
        return;
    }

    // El SDK de SCS entrega una lista terminada en un puntero cuyo 'name' es nulo
    while !(*attr_ptr).name.is_null() {
        let attr = &*attr_ptr;
        let attr_name = CStr::from_ptr(attr.name).to_str().unwrap_or("");

        match attr_name {
            "revenue" => data.job_income = extract_u64(&attr.value),
            "cargo_damage" => data.cargo_damage = extract_f32(&attr.value),
            "distance_km" => data.distance_km = extract_f32(&attr.value),
            _ => {}
        }

        // Avanzamos al siguiente atributo en la memoria
        attr_ptr = attr_ptr.offset(1);
    }
}
