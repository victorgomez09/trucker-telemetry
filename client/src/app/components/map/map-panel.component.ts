import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { TelemetryService } from '../../services/telemetry.service';
import { MapDataService } from '../../services/map.service';

interface TelemetryData {
  truck_position: { x: number; y: number; z: number };
  truck_rotation: { y: number };
  navigation: {
    current_waypoint_index: number;
    waypoints: any[];
  };
}

@Component({
  selector: 'app-map-panel',
  imports: [],
  templateUrl: './map-panel.component.html',
  styleUrl: './map-panel.component.scss',
})
export class MapPanelComponent implements AfterViewInit {
   @ViewChild('map') canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  scale = 0.05; // ajusta según ETS2
  telemetry: any;

  constructor(
    private telemetrySvc: TelemetryService,
    private mapData: MapDataService
  ) {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.telemetrySvc.telemetry$.subscribe(t => {
      this.telemetry = t;
      this.render();
    });
  }

  render() {
    if (!this.telemetry) return;
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const tx = this.telemetry.truck_position.x;
    const tz = this.telemetry.truck_position.z;

    // --- ROADS ---
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;

    this.mapData.roads.features.forEach((f: any) => {
      const coords = f.geometry.coordinates;
      ctx.beginPath();

      coords.forEach((c: number[], i: number) => {
        const x = centerX + (c[0] - tx) * this.scale;
        const y = centerY - (c[1] - tz) * this.scale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });

      ctx.stroke();
    });

    // --- GPS ROUTE ---
    const nav = this.telemetry.navigation;
    if (nav?.waypoints?.length) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 3;
      ctx.beginPath();

      nav.waypoints.forEach((wp: any, i: number) => {
        const x = centerX + (wp.x - tx) * this.scale;
        const y = centerY - (wp.z - tz) * this.scale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });

      ctx.stroke();
    }

    // --- CITIES ---
    ctx.fillStyle = '#facc15';
    ctx.font = '10px sans-serif';

    this.mapData.cities.features.forEach((c: any) => {
      const x = centerX + (c.geometry.coordinates[0] - tx) * this.scale;
      const y = centerY - (c.geometry.coordinates[1] - tz) * this.scale;
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillText(c.properties.name, x + 4, y);
    });

    // --- TRUCK ---
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.telemetry.truck_rotation.y);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
