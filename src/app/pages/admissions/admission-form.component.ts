import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Admission } from '../../models/admission.model';
import { AdmissionService } from '../../services/admission.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admission-form.component.html',
  styleUrls: ['./admission-form.component.css'],
})
export class AdmissionFormComponent {
  isEdit = signal(false);
  loading = signal(false);
  err = signal('');

  motifs = [
    'SCA (Syndrome coronarien aigu)',
    'Insuffisance cardiaque',
    'Trouble du rythme',
    'HTA maligne',
    'Douleur thoracique',
    'Syncope',
    'AVC / AIT',
    'Autre urgence cardio',
  ];

  model: Admission = {
    patientId: 0,
    motif: this.motifs[0],
    dateEntree: '',
    histoireMaladie: '',
  };

  private id?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private admissionService: AdmissionService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);

      this.loading.set(true);
      this.admissionService.get(this.id).subscribe({
        next: (a) => {
          // datetime-local attend "YYYY-MM-DDTHH:mm"
          const normalized = {
            ...a,
            dateEntree: this.toDateTimeLocal(a?.dateEntree),
          } as Admission;

          this.model = normalized;
          this.loading.set(false);
        },
        error: () => {
          this.err.set('Impossible de charger l’admission.');
          this.loading.set(false);
        },
      });
    } else {
      // Valeur par défaut date entrée: maintenant
      this.model.dateEntree = this.nowDateTimeLocal();
    }
  }

  get pageTitle(): string {
    return this.isEdit() ? 'Modifier admission' : 'Nouvelle admission';
  }

  get saveLabel(): string {
    return this.isEdit() ? 'Mettre à jour' : 'Enregistrer';
  }

  private nowDateTimeLocal(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private toDateTimeLocal(v: any): string {
    if (!v) return '';
    const s = String(v);
    // "2026-01-04T10:20:00" => "2026-01-04T10:20"
    if (s.includes('T')) return s.substring(0, 16);
    // "2026-01-04" => "2026-01-04T00:00"
    if (s.length >= 10) return `${s.substring(0, 10)}T00:00`;
    return s;
  }

  reset() {
    this.err.set('');
    if (this.isEdit() && this.id) {
      // recharge depuis serveur
      this.loading.set(true);
      this.admissionService.get(this.id).subscribe({
        next: (a) => {
          this.model = { ...a, dateEntree: this.toDateTimeLocal(a?.dateEntree) } as Admission;
          this.loading.set(false);
        },
        error: () => {
          this.err.set('Impossible de recharger l’admission.');
          this.loading.set(false);
        },
      });
      return;
    }

    this.model = {
      patientId: 0,
      motif: this.motifs[0],
      dateEntree: this.nowDateTimeLocal(),
      histoireMaladie: '',
    };
  }

  save() {
    this.err.set('');

    if (!this.model.patientId || this.model.patientId <= 0) {
      this.err.set('Patient ID obligatoire.');
      return;
    }
    if (!this.model.motif) {
      this.err.set('Motif obligatoire.');
      return;
    }

    // payload (datetime-local => "YYYY-MM-DDTHH:mm")
    const payload: Admission = {
      ...this.model,
      dateEntree: this.model.dateEntree || this.nowDateTimeLocal(),
    };

    const req = this.isEdit() && this.id
      ? this.admissionService.update(this.id, payload)
      : this.admissionService.create(payload);

    this.loading.set(true);
    req.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/admissions');
      },
      error: () => {
        this.loading.set(false);
        this.err.set('Erreur enregistrement. Vérifie backend / CORS.');
      },
    });
  }
}
