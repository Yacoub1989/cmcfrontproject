import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabRequest } from './lab-request';

describe('LabRequest', () => {
  let component: LabRequest;
  let fixture: ComponentFixture<LabRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
