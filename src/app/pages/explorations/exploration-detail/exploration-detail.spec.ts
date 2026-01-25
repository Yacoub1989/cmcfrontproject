import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorationDetail } from './exploration-detail';

describe('ExplorationDetail', () => {
  let component: ExplorationDetail;
  let fixture: ComponentFixture<ExplorationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorationDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
