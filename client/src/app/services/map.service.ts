import { Injectable } from '@angular/core';
// import roads from '../../assets/map-data/roads.geojson';
// import cities from '../../assets/map-data/cities.geojson';

@Injectable({ providedIn: 'root' })
export class MapDataService {
  roads: any = {};
  cities: any = {};
}