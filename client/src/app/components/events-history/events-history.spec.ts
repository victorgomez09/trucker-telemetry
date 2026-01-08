import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsHistory } from './events-history';

describe('EventsHistory', () => {
  let component: EventsHistory;
  let fixture: ComponentFixture<EventsHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
