import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { Admission } from '../../models/admission.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admission-view.component.html',
  styleUrls: ['./admission-view.component.css'],
})
export class AdmissionViewComponent {
  loading = signal(true);
  err = signal('');
  admission = signal<Admission | null>(null);

  private id = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private admissionService: AdmissionService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    if (!idParam || !Number.isFinite(this.id)) {
      this.err.set('ID admission invalide.');
      this.loading.set(false);
      return;
    }

    this.load(this.id);
  }

  private load(id: number) {
    this.loading.set(true);
    this.err.set('');

    this.admissionService.get(id).subscribe({
      next: (a) => {
        // ✅ Normalisation de dateEntree pour affichage
        const normalized: Admission = {
          ...a,
          dateEntree: this.prettyDateTime((a as any)?.dateEntree),
        } as Admission;

        this.admission.set(normalized);
        this.loading.set(false);
      },
      error: () => {
        this.err.set('Impossible de charger l’admission.');
        this.loading.set(false);
      },
    });
  }

  // ✅ getters “safe” pour le HTML (pas de as any dans template)
  get lit(): string {
    const a: any = this.admission();
    const v = a?.lit;
    return v ? String(v) : '-';
  }

  get histoireMaladie(): string {
    const a: any = this.admission();
    const v = a?.histoireMaladie;
    return v ? String(v) : '—';
  }

  goEdit() {
    this.router.navigate(['/admissions', this.id, 'edit']);
  }

  private prettyDateTime(v: any): string {
    if (!v) return '-';
    const s = String(v);
    if (s.includes('T')) return s.substring(0, 16).replace('T', ' ');
    return s.substring(0, 10);
  }
}
