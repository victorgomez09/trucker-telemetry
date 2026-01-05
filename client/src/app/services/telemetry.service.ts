import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { BehaviorSubject, catchError, from, interval, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private telemetrySubject = new BehaviorSubject<any>({});
  telemetry$ = this.telemetrySubject.asObservable();

  constructor() {
    // Escuchar eventos push desde Tauri
    listen('telemetry:update', (event: any) => {
      console.log('Received telemetry update:', event.payload);
      this.telemetrySubject.next(JSON.parse(event.payload));
    });
  }

  getTelemetryStream(): Observable<any> {
    // Cada 100ms pedimos datos al backend de Rust
    return interval(100).pipe(
      switchMap(() => { console.log("running pipe"); return from(invoke<any>('read_telemetry')) }),
      catchError(err => {
        console.error("Error leyendo telemetría:", err);
        return [];
      })
    );
  }
}
