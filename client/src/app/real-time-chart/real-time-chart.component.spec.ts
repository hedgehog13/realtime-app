import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeChartComponent } from './real-time-chart.component';

describe('RealTimeChartComponent', () => {
  let component: RealTimeChartComponent;
  let fixture: ComponentFixture<RealTimeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealTimeChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RealTimeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
