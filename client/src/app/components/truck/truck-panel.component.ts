import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-truck-panel',
  imports: [CommonModule],
  templateUrl: './truck-panel.component.html',
  styleUrl: './truck-panel.component.scss',
})
export class TruckPanelComponent implements OnInit {
  private readonly telemetryService = inject(TelemetryService);

  telemetry: WritableSignal<any> = signal({});

  ngOnInit(): void {
    this.telemetryService.telemetry$.subscribe((data) => {
      this.telemetry = data;
    });
  }
}
