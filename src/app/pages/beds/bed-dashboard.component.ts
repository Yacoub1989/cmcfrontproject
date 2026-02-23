import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { Admission } from '../../models/admission.model';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLinkActive, RouterOutlet } from '@angular/router';

type BedStatus = 'DISPONIBLE' | 'OCCUPE' | 'HORS_SERVICE';

type BedCard = {
  code: string;              // ex: "A1"
  status: BedStatus;
  admission?: Admission;     // si occupé
};

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bed-dashboard.component.html',
  styleUrls: ['./bed-dashboard.component.css'],
})
export class BedDashboardComponent {
  // ✅ Définis tes 8 lits ici
  beds = signal<string[]>(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']);

  // (optionnel) lits hors service
  outOfService = signal<Set<string>>(new Set<string>([])); // ex: new Set(['A8'])

  admissions = signal<Admission[]>([]);
  loading = signal(false);

  // 🔎 map lit -> admission la plus récente (ou active)
  private bedToAdmission = computed(() => {
    const map = new Map<string, Admission>();

    for (const a of this.admissions()) {
      const lit = (a as any)?.lit ? String((a as any).lit).trim() : '';
      if (!lit) continue;

      // si plusieurs admissions sur le même lit, prendre la plus récente (dateEntree)
      const current = map.get(lit);
      if (!current) {
        map.set(lit, a);
        continue;
      }

      const d1 = new Date(String((a as any).dateEntree || '')).getTime() || 0;
      const d2 = new Date(String((current as any).dateEntree || '')).getTime() || 0;
      if (d1 >= d2) map.set(lit, a);
    }

    return map;
  });

  bedCards = computed<BedCard[]>(() => {
    const oos = this.outOfService();
    const map = this.bedToAdmission();

    return this.beds().map((code) => {
      if (oos.has(code)) {
        return { code, status: 'HORS_SERVICE' as const };
      }

      const adm = map.get(code);
      if (adm) return { code, status: 'OCCUPE' as const, admission: adm };

      return { code, status: 'DISPONIBLE' as const };
    });
  });

  // ✅ Stats top
  total = computed(() => this.beds().length);
  horsServiceCount = computed(() => this.outOfService().size);
  occupesCount = computed(() => this.bedCards().filter(b => b.status === 'OCCUPE').length);
  disponiblesCount = computed(() => this.total() - this.horsServiceCount() - this.occupesCount());

  constructor(private admissionService: AdmissionService, public auth: AuthService, private router: Router) {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.admissionService.list().subscribe({
      next: (res) => {
        this.admissions.set(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.admissions.set([]);
        this.loading.set(false);
      },
    });
  }

  // UI helpers
  patientFullName(a?: Admission): string {
    if (!a) return '';
    const nom = (a as any)?.patientNom ?? '';
    const prenom = (a as any)?.patientPrenom ?? '';
    const full = `${nom} ${prenom}`.trim();
    return full || `Patient #${(a as any)?.patientId ?? '-'}`;
  }

  initials(a?: Admission): string {
    const n = this.patientFullName(a);
    const parts = n.split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? 'P';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  }

  dateOnly(v: any): string {
    if (!v) return '-';
    const s = String(v);
    return s.length >= 10 ? s.substring(0, 10) : s;
  }

  // actions
  goCreateAdmissionForBed(code: string) {
    // tu peux ajouter ?lit=A1 si tu veux préremplir dans le form
    // ex: /admissions/new?lit=A1
  }

logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }
}
