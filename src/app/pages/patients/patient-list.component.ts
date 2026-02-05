import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';



type TypeFilter = 'ALL' | 'CIVILE' | 'MILITAIRE';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent {
  q = signal('');
  typeFilter = signal<TypeFilter>('ALL');

  loading = signal(true);
  patients = signal<Patient[]>([]);

  total = computed(() => this.patients().length);

  filtered = computed(() => {
    const s = this.q().trim().toLowerCase();
    const tf = this.typeFilter();
    const list = this.patients();

    return list.filter(p => {
      const matchQ =
        !s ||
        [p.nni, p.nom, p.prenom, p.telephone, p.codePatient]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(s);

      const matchType = tf === 'ALL' || p.typeIdentite === tf;

      return matchQ && matchType;
    });
  });

  constructor(private patientService: PatientService, public auth: AuthService, private router: Router) {
    this.patientService.list().subscribe({
      next: (res) => {
        this.patients.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.patients.set([]);
        this.loading.set(false);
      },
    });
  }

  setTypeFilter(v: TypeFilter) {
    this.typeFilter.set(v);
  }

  initials(p: Patient): string {
    const a = (p.nom?.trim()?.[0] ?? '').toUpperCase();
    const b = (p.prenom?.trim()?.[0] ?? '').toUpperCase();
    return (a + b) || 'P';
  }

logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
