import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { RadioComponent } from "./components/radio/radio";
import { RadioService } from './services/radio.service';
import { TelemetryService } from './services/telemetry.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RadioComponent, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly telemetryService = inject(TelemetryService);
  private radioService = inject(RadioService);

  public readonly appName = 'Trucker Telemetry';

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
