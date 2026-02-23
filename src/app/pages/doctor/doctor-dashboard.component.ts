// src/app/pages/doctor/doctor-dashboard.component.ts
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LabService } from '../../services/lab.service';
import { LabRequest } from '../../models/lab-request.model';
import { AdmissionService } from '../../services/admission.service';
import { Admission } from '../../models/admission.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
})
export class DoctorDashboardComponent {
  loading = signal(false);
  err = signal('');

 // username = signal(this.auth.getUsername() ?? 'docteur');
  username = signal('docteur');


  admissions = signal<Admission[]>([]);
  labMine = signal<LabRequest[]>([]);

  // --- KPI
  admissionsToday = computed(() => this.countToday(this.admissions(), (a) => a?.dateEntree));
  labTotal = computed(() => this.labMine().length);
  labPending = computed(() => this.labMine().filter(r => r.status === 'PENDING').length);
  labInProgress = computed(() => this.labMine().filter(r => r.status === 'IN_PROGRESS').length);
  labDone = computed(() => this.labMine().filter(r => r.status === 'DONE').length);

  alerts = computed(() => {
    let n = 0;
    // exemple d’alerte: beaucoup de pending
    if (this.labPending() >= 5) n++;
    return n;
  });

  // --- lists
  lastAdmissions = computed(() => (this.admissions() ?? []).slice(0, 6));
  lastLab = computed(() => (this.labMine() ?? []).slice(0, 6));

  constructor(
    private auth: AuthService,
    private router: Router,
    private lab: LabService,
    private admissionService: AdmissionService
  ) {
    this.username.set(this.auth.getUsername() ?? 'docteur');
    this.refresh();
  }

  refresh() {
    this.err.set('');
    this.loading.set(true);

    // admissions (si ton endpoint renvoie toutes les admissions)
    this.admissionService.list().subscribe({
      next: (res) => {
        const sorted = [...(res ?? [])].sort((a, b) =>
          String(b?.dateEntree ?? '').localeCompare(String(a?.dateEntree ?? ''))
        );
        this.admissions.set(sorted);
        this.loading.set(false);
      },
      error: (e) => {
        console.error(e);
        this.admissions.set([]);
        this.loading.set(false);
      }
    });


  }

/*  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
*/

  // -----------------------
  // helpers
  // -----------------------
  private countToday<T>(arr: T[], getDate: (x: any) => any): number {
    const today = this.toYmd(new Date());
    return (arr ?? []).filter((x: any) => {
      const v = getDate(x);
      const ymd = this.extractYmd(v);
      return ymd === today;
    }).length;
  }

  private extractYmd(v: any): string {
    if (!v) return '';
    const s = String(v);
    // supports: "2026-01-06T10:20:00" or "2026-01-06" or datetime-local
    return s.length >= 10 ? s.substring(0, 10) : '';
  }

  private toYmd(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }
}
