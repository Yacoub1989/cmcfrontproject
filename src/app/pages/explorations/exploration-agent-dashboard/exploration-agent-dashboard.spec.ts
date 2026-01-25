import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorationAgentDashboard } from './exploration-agent-dashboard';

describe('ExplorationAgentDashboard', () => {
  let component: ExplorationAgentDashboard;
  let fixture: ComponentFixture<ExplorationAgentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorationAgentDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExplorationAgentDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
