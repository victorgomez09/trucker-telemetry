use crate::telemetry::TelemetryData;
use shared_memory::{Shmem, ShmemConf};
use lazy_static::lazy_static;
use std::sync::Mutex;
use bincode;

lazy_static! {
    static ref SHMEM_LOCK: Mutex<()> = Mutex::new(());
}

const SHMEM_NAME: &str = "ETS2_FULL_TELEMETRY";
const SHMEM_SIZE: usize = 65000;

// 🔹 Inicializa o abre Shmem dinámicamente
fn get_shmem() -> Shmem {
    ShmemConf::new()
        .os_id(SHMEM_NAME)
        .size(SHMEM_SIZE)
        .create()
        .or_else(|_| ShmemConf::new().os_id(SHMEM_NAME).size(SHMEM_SIZE).open())
        .expect("Cannot create/open shared memory")
}

pub fn write_telemetry(data: &TelemetryData) {
    let _guard = SHMEM_LOCK.lock().unwrap();
    let shmem = get_shmem();
    let bytes = bincode::serialize(data).expect("Serialization failed");
    unsafe {
        std::ptr::copy_nonoverlapping(bytes.as_ptr(), shmem.as_ptr(), bytes.len());
    }
}

pub fn read_telemetry() -> TelemetryData {
    let _guard = SHMEM_LOCK.lock().unwrap();
    let shmem = get_shmem();
    let slice = unsafe { shmem.as_slice() };
    bincode::deserialize(slice).expect("Deserialization failed")
}
