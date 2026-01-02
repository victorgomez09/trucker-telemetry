import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-trailer-panel',
  imports: [],
  templateUrl: './trailer-panel.component.html',
  styleUrl: './trailer-panel.component.scss',
})
export class TrailerPanelComponent implements OnInit {
  private readonly telemetryService = inject(TelemetryService);

  telemetry: WritableSignal<any> = signal({});

  ngOnInit(): void {
    this.telemetryService.telemetry$.subscribe((data) => {
      this.telemetry = data;
    });
  }
}
