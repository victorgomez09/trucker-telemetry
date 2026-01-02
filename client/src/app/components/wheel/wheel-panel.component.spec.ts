import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelPanelComponent } from './wheel-panel.component';

describe('WheelPanelComponent', () => {
  let component: WheelPanelComponent;
  let fixture: ComponentFixture<WheelPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
