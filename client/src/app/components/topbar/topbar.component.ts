import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit {
  private readonly telemetryService = inject(TelemetryService);

  telemetry: WritableSignal<any> = signal({});

  ngOnInit(): void {
    this.telemetryService.telemetry$.subscribe((data) => {
      this.telemetry = data;
    });
  }
}
