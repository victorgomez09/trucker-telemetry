mod telemetry;
mod shared_memory;

use telemetry::TelemetryData;
use shared_memory::{write_telemetry};

#[no_mangle]
pub extern "C" fn ets2_plugin_initialize() {
    println!("[ETS2 Plugin] Shared memory initialized");
}

#[no_mangle]
pub extern "C" fn ets2_telemetry_update(data: *const TelemetryData) {
    unsafe {
        if let Some(val) = data.as_ref() {
            write_telemetry(val);
        }
    }
}
