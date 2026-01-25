import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { api } from '../../../core/api/http';

type Status = 'DEMANDEE' | 'EN_COURS' | 'TERMINEE';
type Urgence = 'NORMAL' | 'URGENT';

interface ExplorationRequest {
  id: number;
  admissionId: number;
  patientNom?: string;
  explorations: string[];     // ex: ["ECG","BIOLOGIE","RX_TH"]
  urgence: Urgence;
  note?: string;
  status: Status;
  createdAt?: string;
}

interface ExplorationResult {
  id: number;
  requestId: number;
  resultText: string;
  videoUrl?: string;
  createdAt?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './exploration-detail.component.html',
  styleUrls: ['./exploration-detail.component.css'],
})
export class ExplorationDetailComponent {
  loading = signal(false);
  err = signal('');

  request?: ExplorationRequest;
  result?: ExplorationResult;

  requestId?: number;

  // champs agent
  resultText = '';
  selectedVideo?: File;

  // Si tu as un apiUrl dans environment, remplace base par environment.apiUrl + '/api/explorations'
 // private base = '/api/explorations';

  private a = api();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.requestId = idParam ? Number(idParam) : undefined;

    if (!this.requestId || Number.isNaN(this.requestId)) {
      this.err.set('ID de demande exploration invalide.');
      return;
    }

    this.loadRequest(this.requestId);
  }

  // UI helpers
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

  statusLabel(s: Status) {
    const map: Record<Status, string> = {
      DEMANDEE: 'Demandée',
      EN_COURS: 'En cours',
      TERMINEE: 'Terminée',
    };
    return map[s] ?? s;
  }

  loadRequest(id: number) {
    this.err.set('');
    this.loading.set(true);

    this.http.get<ExplorationRequest>(`${this.a.base}/explorations/requests/${id}`).subscribe({
      next: (r) => {
        this.request = r;
        // Préremplir texte si backend renvoie un champ resultText (optionnel)
        // sinon laisser vide
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.err.set("Impossible de charger la demande d'exploration.");
      },
    });
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedVideo = input.files?.[0] ?? undefined;
  }

  // Envoi résultat texte + vidéo
  submitResult() {
    this.err.set('');
    if (!this.requestId) return;

    const txt = (this.resultText || '').trim();
    if (!txt && !this.selectedVideo) {
      this.err.set('Ajoute un résultat texte et/ou une vidéo.');
      return;
    }

    const fd = new FormData();
    fd.append('resultText', txt);
    if (this.selectedVideo) fd.append('video', this.selectedVideo);

    this.loading.set(true);
    this.http.post<ExplorationResult>(`${this.a.base}/explorations/requests/${this.requestId}/result`, fd).subscribe({
      next: (res) => {
        this.result = res;
        // si tu veux : passer status en EN_COURS automatiquement
        if (this.request && this.request.status === 'DEMANDEE') {
          this.request.status = 'EN_COURS';
        }
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.err.set(e?.error?.message || "Erreur lors de l'envoi du résultat.");
      },
    });
  }

  // Marquer Terminée
  markDone() {
    this.err.set('');
    if (!this.requestId) return;

    this.loading.set(true);
    this.http.put(`${this.a.base}/explorations/requests/${this.requestId}/status`, { status: 'TERMINEE' }).subscribe({
      next: () => {
        if (this.request) this.request.status = 'TERMINEE';
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.err.set('Impossible de mettre le statut à Terminée.');
      },
    });
  }

  // Retour
  back() {
    this.router.navigateByUrl('/explorations/agent');
  }
}
