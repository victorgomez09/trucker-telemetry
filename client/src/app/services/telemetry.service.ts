import { Injectable } from '@angular/core';
import { listen } from '@tauri-apps/api/event';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private telemetrySubject = new BehaviorSubject<any>({});
  telemetry$ = this.telemetrySubject.asObservable();

  constructor() {
    // Escuchar eventos push desde Tauri
    listen('telemetry:update', (event: any) => {
      this.telemetrySubject.next(JSON.parse(event.payload));
    });
  }
}
