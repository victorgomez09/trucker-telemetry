use serde::{Serialize, Deserialize};

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct Vec3 { pub x: f32, pub y: f32, pub z: f32 }

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct WheelData {
    pub suspension: f32,
    pub velocity: f32,
    pub steering: f32,
    pub rotation: f32,
    pub on_ground: bool,
    pub lift: f32,
    pub position: Vec3,
}

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct DamageData {
    pub engine: f32,
    pub transmission: f32,
    pub cabin: f32,
    pub chassis: f32,
    pub wheels: f32,
}

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct LightState {
    pub low_beam: bool,
    pub high_beam: bool,
    pub blink_left: bool,
    pub blink_right: bool,
    pub beacon: bool,
    pub brake: bool,
    pub reverse: bool,
    pub parking: bool,
}

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct NavWaypoint {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub distance_to_next: f32,
    pub is_reached: bool,
}

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct NavigationData {
    pub current_waypoint_index: u32,
    pub waypoint_count: u32,
    pub waypoints: Vec<NavWaypoint>,
}

#[repr(C)]
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct TelemetryData {
    pub timestamp: f32,
    pub paused: bool,
    pub game_time: f32,

    pub truck_speed: f32,
    pub truck_rpm: f32,
    pub truck_gear: i32,
    pub forward_gears: i32,
    pub reverse_gears: i32,
    pub fuel: f32,
    pub fuel_capacity: f32,
    pub adblue: f32,
    pub odometer: f32,

    pub input_steering: f32,
    pub input_throttle: f32,
    pub input_brake: f32,
    pub input_clutch: f32,

    pub truck_position: Vec3,
    pub truck_rotation: Vec3,

    pub wheels: [WheelData; 8],
    pub light_state: LightState,
    pub damage: DamageData,

    pub trailer_attached: bool,
    pub trailer_position: Vec3,
    pub trailer_rotation: Vec3,
    pub trailer_wheels: [WheelData; 8],
    pub navigation: NavigationData,
}
