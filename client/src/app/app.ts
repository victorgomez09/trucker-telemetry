import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { EventsHistory } from './components/events-history/events-history';
import { TelemetryService } from './services/telemetry.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EventsHistory],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly telemetryService = inject(TelemetryService);

  appName = 'Trucker Telemetry';
  isConnected = this.telemetryService.isConnected;
  telemetry = this.telemetryService.data;

  hasJob = computed(() => {
    const data = this.telemetry();
    return data && data.city_source && data.city_source.trim() !== '' && data.job_finished === 0;
  });

  progressPercentage = computed(() => {
    const data = this.telemetry();
    if (!data || data.planned_distance <= 0) return 0;

    // Aquí podrías implementar la lógica: (Distancia Inicial - Distancia Restante) / Distancia Inicial
    // Por ahora usaremos un valor de ejemplo o basado en los datos que tengas
    return 45; // Ejemplo: 45% completado
  });

  // Signal computado para exceso de velocidad
  public isSpeeding = computed(() => {
    const data = this.telemetry();
    return data && data.speed > data.speed_limit + 5; // Margen de 5km/h
  });

  // Signal para trampas
  public cheatDetected = computed(() => this.telemetry()?.is_cheater === 1);
  public offlineMode = this.telemetryService.isOfflineMode;

  async enviarTrabajo() {
    try {
      console.log('Enviando reporte...', this.telemetry());
      await this.telemetryService.sendToBackend(this.telemetry());
    } catch (e) {
      console.error('Error al procesar el envío:', e);
    }
  }
}
