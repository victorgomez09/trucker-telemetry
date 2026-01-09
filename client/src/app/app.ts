import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { EventsHistory } from './components/events-history/events-history';
import { TelemetryService } from './services/telemetry.service';
import { RouterOutlet } from '@angular/router';
import { RadioService } from './services/radio.service';
import { RadioComponent } from "./components/radio/radio";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RadioComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly telemetryService = inject(TelemetryService);
  private radioService = inject(RadioService);

  appName = 'Trucker Telemetry';

  // Exponemos los Signals del servicio para que el HTML los vea
  public telemetry = this.telemetryService.data;
  public isConnected = this.telemetryService.isConnected;

  // Signals de estado para la interfaz global (Sidebar)
  public radioIsPlaying = computed(() => this.radioService.isPlaying());

  // Lógica de validación de trabajo activo
  public hasJob = computed(() => {
    const data = this.telemetry();
    return data && data.city_destination && data.city_destination.trim() !== '';
  });

  ngOnInit() {
    // Aquí podrías inicializar configuraciones globales de Tauri si fuera necesario
    console.log('ETS2 Bridge Dashboard Initialized');
  }
}
