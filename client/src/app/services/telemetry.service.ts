import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

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
      this._isConnected.set(false);
      this._telemetryData.set(null);
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
