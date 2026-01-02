import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPanelComponent } from './map-panel.component';

describe('MapPanelComponent', () => {
  let component: MapPanelComponent;
  let fixture: ComponentFixture<MapPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
