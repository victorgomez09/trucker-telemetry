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

@Component({
  selector: 'app-map-panel',
  imports: [],
  templateUrl: './map-panel.component.html',
  styleUrl: './map-panel.component.scss',
})
export class MapPanelComponent implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly telemetryService = inject(TelemetryService);

  telemetry: WritableSignal<any> = signal({});
  ctx!: CanvasRenderingContext2D;

  ngOnInit(): void {
    this.telemetryService.telemetry$.subscribe((data) => {
      this.telemetry = data;
      this.draw();
    });
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
  }

  draw() {
    if (!this.ctx || !this.telemetry().truck_position) return;
    const ctx = this.ctx;
    const canvas = this.canvasRef.nativeElement;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert ETS2 coords to canvas coords
    const x = canvas.width / 2 + this.telemetry().truck_position.x * 2;
    const y = canvas.height / 2 - this.telemetry().truck_position.z * 2;

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Heading line
    const heading = this.telemetry().truck_rotation.y || 0;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20 * Math.sin(heading), y - 20 * Math.cos(heading));
    ctx.stroke();
  }
}
