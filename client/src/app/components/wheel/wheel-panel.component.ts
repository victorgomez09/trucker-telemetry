import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-wheel-panel',
  imports: [],
  templateUrl: './wheel-panel.component.html',
  styleUrl: './wheel-panel.component.scss',
})
export class WheelPanelComponent implements OnInit {
  private readonly telemetryService = inject(TelemetryService);

  telemetry: WritableSignal<any> = signal({});

  ngOnInit(): void {
    this.telemetryService.telemetry$.subscribe((data) => {
      this.telemetry = data;
    });
  }
}
