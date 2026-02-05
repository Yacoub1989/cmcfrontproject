  import { Component, signal } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ActivatedRoute, Router, RouterLink } from '@angular/router';
  import { FormsModule } from '@angular/forms';
  import { HttpClient } from '@angular/common/http';
  import { ExplorationService, CreateExplorationRequest } from '../../../services/exploration.service';
  import { AuthService } from '../../../services/auth.service';


  type AdmissionLite = { patientNom?: string; patientId?: number; lit?: string };

  @Component({
    standalone: true,
    selector: 'app-exploration-form',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './exploration-form.component.html',
    styleUrls: ['./exploration-form.component.css'],
  })
  export class ExplorationFormComponent {
    loading = signal(false);
    err = signal('');

    admissionId!: number;

    patientNom = '';
    patientId?: number;

    // ✅ types disponibles
     types = ['RADIO THORAX', 'ECHO CARDIOGRAPHIE', 'ECHODOPPLER ARTERIEL', 'ECHODOPPLER VEINEUX', 'HALTER RYTHMIQUE', 'HALTER ECG',
      'EPREUVE DEFFORT','CORO'];

    // ✅ modèle (multi choix)
    model = {
      explorations: [] as string[],
      urgence: 'NORMAL' as 'NORMAL' | 'URGENT',
      note: '',
    };

    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private http: HttpClient,
      public auth: AuthService,
      private explorationService: ExplorationService
    ) {
      const qp = this.route.snapshot.queryParamMap.get('admissionId');
      const id = qp ? Number(qp) : NaN;

      if (!id || Number.isNaN(id)) {
        this.err.set('AdmissionId manquant dans l’URL. Exemple: /explorations/new?admissionId=12');
        return;
      }
      this.admissionId = id;

      // 🔎 Charger patientNom pour l’affichage (optionnel)
      this.loadAdmission(this.admissionId);
    }

    labelType(t: string) {
      const map: Record<string, string> = {
        ECG: 'ECG',
        ETT: 'ETT (Échographie)',
        RX_TH: 'RX Thorax',
        CORO: 'Coronarographie',
        BIOLOGIE: 'Biologie',
        AUTRE: 'Autre',
      };
      return map[t] ?? t;
    }

    toggleExploration(t: string, checked: boolean) {
      this.model.explorations = this.model.explorations || [];
      if (checked) {
        if (!this.model.explorations.includes(t)) this.model.explorations.push(t);
      } else {
        this.model.explorations = this.model.explorations.filter((x) => x !== t);
      }
    }

    private loadAdmission(admissionId: number) {
      // ✅ adapte si ton backend est sur un autre host:port
      this.http.get<AdmissionLite>(`/api/admissions/${admissionId}`).subscribe({
        next: (a) => {
          this.patientNom = a?.patientNom ?? '';
          this.patientId = a?.patientId ?? undefined;
        },
        error: () => {
          // pas bloquant
        },
      });
    }

    save() {
      this.err.set('');

      if (!this.admissionId) {
        this.err.set('AdmissionId manquant.');
        return;
      }

      if (!this.model.explorations || this.model.explorations.length === 0) {
        this.err.set('Sélectionne au moins une exploration.');
        return;
      }

      const payload: CreateExplorationRequest = {
        admissionId: this.admissionId,
        // optionnel: si tu stockes patientNom dans la demande
        patientNom: this.patientNom || undefined,
        explorations: this.model.explorations,
        urgence: this.model.urgence,
        note: (this.model.note || '').trim(),
      };

      this.loading.set(true);
      this.explorationService.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          // retour admissions ou dashboard agent
          this.router.navigateByUrl('/admissions');
        },
        error: (e) => {
          this.loading.set(false);
          this.err.set(e?.error?.message || 'Erreur lors de la création de la demande.');
        },
      });
    }

  logout() {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
