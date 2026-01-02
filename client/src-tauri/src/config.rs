use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Default)]
pub struct AppConfig {
    pub ets2_path: Option<String>,
    pub ats_path: Option<String>,
}

impl AppConfig {
    pub fn path() -> PathBuf {
        let mut dir = dirs::config_dir().unwrap();
        dir.push("trucker-client");
        fs::create_dir_all(&dir).ok();
        dir.push("config.json");
        dir
    }

    pub fn load() -> Self {
        let path = Self::path();
        if path.exists() {
            fs::read_to_string(path)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default()
        } else {
            Self::default()
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let json = serde_json::to_string_pretty(self).unwrap();
        fs::write(Self::path(), json).map_err(|e| e.to_string())
    }

    pub fn is_complete(&self) -> bool {
        self.ets2_path.is_some() || self.ats_path.is_some()
    }
}
