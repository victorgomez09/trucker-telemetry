import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar.component';
import { TruckPanelComponent } from './components/truck/truck-panel.component';
import { TrailerPanelComponent } from './components/trailer/trailer-panel.component';
import { WheelPanelComponent } from './components/wheel/wheel-panel.component';
import { MapPanelComponent } from './components/map/map-panel.component';

@Component({
  selector: 'app-root',
  imports: [TopbarComponent, TruckPanelComponent, TrailerPanelComponent, WheelPanelComponent, MapPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('client');
}
