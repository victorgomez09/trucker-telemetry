import { Injectable, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

export interface AppConfig {
  ets2_path?: string;
  ats_path?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  config = signal<AppConfig | null>(null);

  async load() {
    const cfg = await invoke<AppConfig>('get_config');
    this.config.set(cfg);
    return cfg;
  }

  async save(cfg: AppConfig) {
    await invoke('save_config', { config: cfg });
    this.config.set(cfg);
  }

  isConfigured(): boolean {
    const c = this.config();
    return !!(c?.ets2_path || c?.ats_path);
  }
}
