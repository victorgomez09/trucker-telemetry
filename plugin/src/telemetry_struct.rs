#[repr(C)]
pub struct Ets2Telemetry {
    // Control y Metadatos
    pub magic: u32,   // 0x45545332 ("ETS2")
    pub version: u32, // Versión de tu estructura

    // Motor y Movimiento
    pub speed: f32, // m/s
    pub rpm: f32,
    pub gear: i32,
    pub cruise_control: f32, // m/s

    // Consumibles
    pub fuel: f32, // Litros
    pub fuel_capacity: f32,
    pub adblue: f32,

    // Presiones y Temperaturas
    pub brake_air_pressure: f32,
    pub oil_temperature: f32,
    pub water_temperature: f32,

    // Luces y Electrónica (Boleanos como i32 para compatibilidad C)
    pub light_lbl: i32, // Luces de cruce
    pub light_hbl: i32, // Luces largas
}
