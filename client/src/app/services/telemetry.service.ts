import { Injectable, signal, computed, isDevMode } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

const mockData = {
  "speed": 44.819244,
  "rpm": 1009.179,
  "gear": 10,
  "fuel_amount": 800,
  "fuel_consumption": 61.285027,
  "fuel_capacity": 1250,
  "fuel_warning_factor": 0.15,
  "cargo_damage": 0.45703262,
  "cargo_name": "Plásticos usados",
  "truck_name": "Renault Premium",
  "city_source": "Bergen",
  "city_destination": "Bergen",
  "planned_distance": 14,
  "navigation_distance": 4748.749,
  "job_income": 453,
  "has_active_job": true,
  "job_finished": 0,
  "status_message": "En ruta a Bergen",
  "speed_limit": -3.6,
  "events": [
    {
      "event_type": 4,
      "value": 420,
      "text": "speeding_camera",
      "timestamp": 2616328
    },
    {
      "event_type": 4,
      "value": 400,
      "text": "crash",
      "timestamp": 2605921
    }
  ]
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private _telemetryData = signal<any>(null);
  private _isConnected = signal<boolean>(false);

  public data = computed(() => this._telemetryData());
  public isConnected = computed(() => this._isConnected());
  public isOfflineMode = signal<boolean>(false);

  constructor() {
    // Polling de alta frecuencia
    setInterval(() => this.updateTelemetry(), 100);
  }

  private async updateTelemetry() {
    try {
      const data = await invoke('get_telemetry');
      console.log("data", data)
      this._telemetryData.set(data);
      this._isConnected.set(true);
    } catch (error) {
      console.error('Error al leer la telemetría:', error);
      if (isDevMode()) {
        this._telemetryData.set(mockData);
        this._isConnected.set(true);
      } else {
        this._isConnected.set(false);
        this._telemetryData.set(null);
      }
    }
  }

  async sendToBackend(data: any) {
    try {
      await invoke('submit_job', { data });
      await invoke('reset_job_status');

      this.isOfflineMode.set(false);
      return true;
    } catch (error) {
      console.error('Error de red, pasando a modo offline');
      this.isOfflineMode.set(true);
      return false;
    }
  }
}
