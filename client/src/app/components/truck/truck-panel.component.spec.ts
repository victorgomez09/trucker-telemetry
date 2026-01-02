import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckPanelComponent } from './truck-panel.component';

describe('TruckPanelComponent', () => {
  let component: TruckPanelComponent;
  let fixture: ComponentFixture<TruckPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruckPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruckPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
