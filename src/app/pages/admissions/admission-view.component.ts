import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { Admission } from '../../models/admission.model';
import { ExplorationDoctorService, ExplorationView } from '../../services/exploration-doctor.service';
import { LabService, LabOrder } from '../../services/lab.service';


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

  explorations = signal<ExplorationView[]>([]);
  expLoading = signal(false);


  labOrders = signal<any[]>([]);
  labLoading = signal(false);

  objectKeys = Object.keys;

  private id = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expService: ExplorationDoctorService,
    private labService: LabService,
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

    if (idParam) {
        this.loadExplorationsForAdmission(Number(idParam));
      }

    this.loadLabState();
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
        this.loadLabOrders(id);
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

goExploration() {
  // si on est en création, on empêche
//  if (!this.isEdit() || !this.id) {
//    this.err.set("Enregistre l'admission d'abord, puis demande une exploration.");
//    return;
//  }
  this.router.navigate(['/explorations/new'], { queryParams: { admissionId: this.id } });
}

goToLabo() {
    this.router.navigate(['/lab', this.id]);
  }

loadExplorationsForAdmission(admissionId: number) {
  this.expLoading.set(true);
  this.expService.listByAdmission(admissionId).subscribe({
    next: (rows) => {
      this.explorations.set(rows || []);
      this.expLoading.set(false);
    },
    error: () => {
      this.expLoading.set(false);
      // optionnel: ne pas bloquer la page admission
    }
  });
}

labelType(t: string) {
  const map: Record<string, string> = {
    ECG: 'ECG',
    ETT: 'ETT (Écho)',
    RX_TH: 'RX Thorax',
    CORO: 'Coronarographie',
    BIOLOGIE: 'Biologie',
    AUTRE: 'Autre',
  };
  return map[t] ?? t;
}

statusLabel(s: any) {
  const map: any = { DEMANDEE: 'Demandée', EN_COURS: 'En cours', TERMINEE: 'Terminée' };
  return map[s] ?? s;
}

labRequested = false;
labStatus: 'NONE'|'PENDING'|'DONE' = 'NONE';
loadingLab = false;

loadLabState() {
  this.loadingLab = true;
  this.admissionService.labState(this.id).subscribe({
    next: (s) => {
      this.labRequested = !!s.labRequested;
      this.labStatus = s.labStatus;
      this.loadingLab = false;
    },
    error: () => { this.loadingLab = false; }
  });
}

requestLab() {
  this.admissionService.requestLab(this.id).subscribe({
    next: () => this.loadLabState()
  });
}

openLab() {
  this.router.navigate(['/lab', this.id]);
}

goRequestLab() {
  this.router.navigate(['/lab/request', this.id]);
}



loadLabOrders(admissionId: number) {
  this.labLoading.set(true);

  this.labService.ordersSummary(admissionId).subscribe({
    next: (list) => {
      console.log('LAB ORDERS RECEIVED', list);
      this.labOrders.set(Array.isArray(list) ? list : []);
      this.labLoading.set(false);
    },
    error: (err) => {
      console.error(err);
      this.labOrders.set([]);
      this.labLoading.set(false);
    }
  });
}


 //objectKeys = Object.keys;

}
