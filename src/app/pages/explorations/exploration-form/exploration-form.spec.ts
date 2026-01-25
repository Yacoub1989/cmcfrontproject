import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorationForm } from './exploration-form';

describe('ExplorationForm', () => {
  let component: ExplorationForm;
  let fixture: ComponentFixture<ExplorationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
