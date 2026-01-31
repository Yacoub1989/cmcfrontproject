import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabDashboard } from './lab-dashboard';

describe('LabDashboard', () => {
  let component: LabDashboard;
  let fixture: ComponentFixture<LabDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
