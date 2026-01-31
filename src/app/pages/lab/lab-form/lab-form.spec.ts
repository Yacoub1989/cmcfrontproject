import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabForm } from './lab-form';

describe('LabForm', () => {
  let component: LabForm;
  let fixture: ComponentFixture<LabForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
