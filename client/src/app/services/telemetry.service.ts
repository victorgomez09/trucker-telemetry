import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  // Signals privados para el estado interno
  private _telemetryData = signal<any>(null);
  private _isConnected = signal<boolean>(false);

  // Exponemos los signals de forma pública (solo lectura)
  public data = computed(() => this._telemetryData());
  public isConnected = computed(() => this._isConnected());

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
}