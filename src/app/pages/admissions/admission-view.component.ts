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
        // normaliser dateEntree si besoin (ex: "2026-01-04T10:20:00" => "2026-01-04 10:20")
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

  private prettyDateTime(v: any): string {
    if (!v) return '-';
    const s = String(v);
    // "YYYY-MM-DDTHH:mm:ss" -> "YYYY-MM-DD HH:mm"
    if (s.includes('T')) return s.substring(0, 16).replace('T', ' ');
    // "YYYY-MM-DD" -> "YYYY-MM-DD"
    return s.substring(0, 10);
  }

  goEdit() {
    this.router.navigate(['/admissions', this.id, 'edit']);
  }
}
