use ets2_telemetry_plugin::telemetry::TelemetryData; // tu struct
use shared_memory::Shmem;
use bincode;

const SHMEM_NAME: &str = "ETS2_FULL_TELEMETRY";

fn main() {
    let shmem = Shmem::open_existing(SHMEM_NAME).expect("Cannot open ETS2 shared memory");
    let slice = unsafe { shmem.as_slice() };
    let data: TelemetryData = bincode::deserialize(slice).unwrap();
    println!("{}", serde_json::to_string(&data).unwrap());
}
