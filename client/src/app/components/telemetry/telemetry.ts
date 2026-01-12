import { Component, computed, inject, input, OnInit, signal, Signal } from '@angular/core';
import { EventsHistory } from '../events-history/events-history';
import { TelemetryService } from '../../services/telemetry.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-telemetry',
  imports: [CommonModule, EventsHistory],
  templateUrl: './telemetry.html',
  styleUrl: './telemetry.scss',
})
export class Telemetry {
  private readonly telemetryService = inject(TelemetryService);

  telemetry = this.telemetryService.data;

  hasJob = computed(() => {
    const data = this.telemetry();
    console.log('data', data)
    console.log('return ', (data && data.city_source && data.city_source.trim() !== '' && data.job_finished === 0))
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
