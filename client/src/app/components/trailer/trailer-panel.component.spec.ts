import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerPanelComponent } from './trailer-panel.component';

describe('TrailerPanelComponent', () => {
  let component: TrailerPanelComponent;
  let fixture: ComponentFixture<TrailerPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrailerPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrailerPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
