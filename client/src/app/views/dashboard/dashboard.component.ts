import { Component } from '@angular/core';
import { MapPanelComponent } from '../../components/map/map-panel.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { TrailerPanelComponent } from '../../components/trailer/trailer-panel.component';
import { TruckPanelComponent } from '../../components/truck/truck-panel.component';
import { WheelPanelComponent } from '../../components/wheel/wheel-panel.component';

@Component({
  selector: 'app-dashboard.component',
  imports: [TopbarComponent, TruckPanelComponent, TrailerPanelComponent, WheelPanelComponent, MapPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

}
