import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelemetryService } from './services/telemetry.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('client');

  private readonly telemetryService = inject(TelemetryService);

  data: any;

  ngOnInit(): void {
    this.telemetryService.getTelemetryStream().subscribe(data => {
      this.data = data;
      console.log("Data received in app component:", data);
    });
  }

}
