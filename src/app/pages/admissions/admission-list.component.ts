import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { Admission } from '../../models/admission.model';

type AgeFilter = 'ALL' | 'TODAY' | 'LE7' | 'OLD';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admission-list.component.html',
  styleUrls: ['./admission-list.component.css'],
})
export class AdmissionListComponent {
  q = signal('');
  loading = signal(true);

  admissions = signal<Admission[]>([]);

  // ✅ filtre cliquable
  ageFilter = signal<AgeFilter>('ALL');

  total = computed(() => this.admissions().length);

  // ✅ compteur par catégorie (utile pour afficher "2", etc.)
  countToday = computed(() => this.admissions().filter(a => this.getAgeBucket(a) === 'TODAY').length);
  countLe7 = computed(() => this.admissions().filter(a => this.getAgeBucket(a) === 'LE7').length);
  countOld = computed(() => this.admissions().filter(a => this.getAgeBucket(a) === 'OLD').length);

  filtered = computed(() => {
    const s = this.q().trim().toLowerCase();
    const f = this.ageFilter();
    const list = this.admissions();

    return list.filter(a => {
      // recherche texte
      const matchQ =
        !s ||
        [
          a.id,
          a.patientId,
          a.motif,
          a.dateEntree,
          (a as any)?.dateSortie,
          (a as any)?.statut,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(s);

      // filtre âge admission
      const bucket = this.getAgeBucket(a);
      const matchAge =
        f === 'ALL' ||
        (f === 'TODAY' && bucket === 'TODAY') ||
        (f === 'LE7' && bucket === 'LE7') ||
        (f === 'OLD' && bucket === 'OLD');

      return matchQ && matchAge;
    });
  });

  constructor(private admissionService: AdmissionService) {
    this.admissionService.list().subscribe({
      next: (res) => {
        this.admissions.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.admissions.set([]);
        this.loading.set(false);
      },
    });
  }

  setAgeFilter(v: AgeFilter) {
    this.ageFilter.set(v);
  }

  // --------- Helpers date ----------
  private toDateOnlyString(value?: any): string {
    if (!value) return '';
    const s = String(value);
    // "2026-01-04T10:22:00" -> "2026-01-04"
    return s.length >= 10 ? s.substring(0, 10) : s;
  }

  private parseYMD(ymd: string): Date | null {
    if (!ymd || ymd.length < 10) return null;
    // new Date("2026-01-04") peut dépendre du timezone,
    // donc on parse en local: year, month-1, day
    const y = Number(ymd.substring(0, 4));
    const m = Number(ymd.substring(5, 7));
    const d = Number(ymd.substring(8, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  formatDate(value?: any): string {
    const d = this.toDateOnlyString(value);
    return d || '-';
  }

  // --------- Buckets pour filtres ----------
  getAgeBucket(a: Admission): AgeFilter {
    const ymd = this.toDateOnlyString((a as any)?.dateEntree);
    const entry = this.parseYMD(ymd);
    if (!entry) return 'OLD';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.floor((today.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'TODAY';
    if (diffDays <= 7) return 'LE7';
    return 'OLD';
  }

  badgeLabel(a: Admission): string {
    const b = this.getAgeBucket(a);
    if (b === 'TODAY') return "Aujourd'hui";
    if (b === 'LE7') return "≤ 7 jours";
    return 'Ancien';
  }
}
