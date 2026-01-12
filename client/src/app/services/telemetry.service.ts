import { Injectable, signal, computed, isDevMode } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

const mockData = {
  "speed": 17.17358,
  "rpm": 1353.0471,
  "gear": 4,
  "fuel_consumption": 0,
  "cargo_damage": 0,
  "cargo_name": "Generadores de gasóleo",
  "truck_name": "Renault Premium",
  "city_source": "Zaragoza",
  "city_destination": "Porto",
  "planned_distance": 827,
  "navigation_distance": 823000,
  "job_income": 47775,
  "has_active_job": true,
  "job_finished": 0,
  "status_message": "En ruta a Porto",
  "events": [
    {
      "event_type": 4,
      "value": 0,
      "text": "Trabajo en curso",
      "timestamp": 8291765
    },
    {
      "event_type": 4,
      "value": 0,
      "text": "Trabajo en curso",
      "timestamp": 8283406
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
      const data = await invoke('read_telemetry');
      this._telemetryData.set(data);
      this._isConnected.set(true);
    } catch (error) {
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
