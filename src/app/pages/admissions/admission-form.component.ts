import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Admission } from '../../models/admission.model';
import { AdmissionService } from '../../services/admission.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';


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


facteursRisque = [
  'Hypertension artérielle',
  'Diabète',
  'Tabagisme',
  'Dyslipidémie',
  'Heredité'
];

  model: Admission = {
    patientId: 0,
    motif: this.motifs[0],
    dateEntree: '',
    lit: '',
    histoireMaladie: '',
    cardiovasculaire: '',
    examengeneral: '',
    cardiogramme: '',
    conclusion: '',
    decision: '',
    facteursRisque: [],
    ta: '',
    fc: undefined,
    fr: undefined,
    spo2: undefined,
  };

  private id?: number;

  lockedPatientId = false;


constructor(
  private route: ActivatedRoute,
  private router: Router,
  public auth: AuthService,
  private admissionService: AdmissionService
) {
  const idParam = this.route.snapshot.paramMap.get('id');

  // ✅ Si on arrive depuis /admissions/new?patientId=123
  const qp = this.route.snapshot.queryParamMap.get('patientId');
  if (qp && !idParam) {
    this.model.patientId = Number(qp);
    this.lockedPatientId = true; // 🔒 verrouille le champ
  }

  if (idParam) {
    this.isEdit.set(true);
    this.id = Number(idParam);

    this.loading.set(true);
    this.admissionService.get(this.id).subscribe({
      next: (a) => {
        this.model = {
          ...a,
          lit: (a as any)?.lit ?? '',
          dateEntree: this.toDateTimeLocal((a as any)?.dateEntree),
          facteursRisque: (a as any)?.facteursRisque ?? [],
        } as Admission;

        this.loading.set(false);
      },
      error: () => {
        this.err.set('Impossible de charger l’admission.');
        this.loading.set(false);
      },
    });
  } else {
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
      lit: '',
      histoireMaladie: '',
      cardiovasculaire: '',
      examengeneral: '',
      cardiogramme: '',
      conclusion: '',
      decision: '',
      facteursRisque: [],
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

goExploration() {
  // si on est en création, on empêche
  if (!this.isEdit() || !this.id) {
    this.err.set("Enregistre l'admission d'abord, puis demande une exploration.");
    return;
  }
  this.router.navigate(['/explorations/new'], { queryParams: { admissionId: this.id } });

}

logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}
