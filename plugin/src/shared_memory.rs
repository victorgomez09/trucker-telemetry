use crate::telemetry::TelemetryData;
use bincode;
use lazy_static::lazy_static;
use shared_memory::{Shmem, ShmemConf};
use std::sync::Mutex;

const SHMEM_NAME: &str = "ETS2_TELEMETRY_FULL";
const SHMEM_SIZE: usize = 65536;

lazy_static! {
    static ref SHMEM_LOCK: Mutex<()> = Mutex::new(());
}

fn get_shmem() -> Shmem {
    ShmemConf::new()
        .os_id(SHMEM_NAME)
        .size(SHMEM_SIZE)
        .create()
        .or_else(|_| ShmemConf::new().os_id(SHMEM_NAME).size(SHMEM_SIZE).open())
        .expect("shmem")
}

pub fn write_telemetry(data: &TelemetryData) {
    let _g = SHMEM_LOCK.lock().unwrap();
    let shmem = get_shmem();
    let bytes = bincode::serialize(data).unwrap();
    unsafe {
        std::ptr::copy_nonoverlapping(bytes.as_ptr(), shmem.as_ptr(), bytes.len());
    }
}
