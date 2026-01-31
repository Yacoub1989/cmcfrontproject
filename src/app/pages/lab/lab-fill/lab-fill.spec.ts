import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabFill } from './lab-fill';

describe('LabFill', () => {
  let component: LabFill;
  let fixture: ComponentFixture<LabFill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabFill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabFill);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
