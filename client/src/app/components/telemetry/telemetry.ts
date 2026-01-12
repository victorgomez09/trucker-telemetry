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
    return data && data.city_source && data.city_source.trim() !== '' && data.job_finished === 0;
  });

  isSpeeding = computed(() => {
    const data = this.telemetry();
    return data && data.speed > data.speed_limit + 5; // Margen de 5km/h
  });

  remainingKm = computed(() => {
    const data = this.telemetry();
    if (!data || data.navigation_distance <= 0) return 0;
    return Math.round(data.navigation_distance / 1000 * 10) / 10;
  });

  progress = computed(() => {
    const data = this.telemetry();
    if (!data || data.planned_distance <= 0) return 0;

    const total = data.planned_distance;
    const remaining = data.navigation_distance / 1000;

    let percentage = ((total - remaining) / total) * 100;

    percentage = Math.max(0, Math.min(100, percentage));

    return Math.round(percentage);
  });

  eta = computed(() => {
    const speed = this.telemetry()?.speed || 0;
    const distance = this.remainingKm();

    if (speed < 5 || distance <= 0) return { h: 0, m: 0, totalMins: 0, formatted: '--' };

    const totalMinutes = Math.round((distance / speed) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return {
      h,
      m,
      totalMins: totalMinutes,
      formatted: h > 0 ? `${h}h ${m}m` : `${m}m`
    };
  });

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
