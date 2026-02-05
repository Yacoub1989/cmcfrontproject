import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExplorationAgentService, ExplorationRequestDto, Status } from '../../../services/exploration-agent.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';



@Component({
  standalone: true,
  selector: 'app-exploration-agent-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exploration-agent-dashboard.component.html',
  styleUrls: ['./exploration-agent-dashboard.component.css'],
})
export class ExplorationAgentDashboardComponent {
  loading = signal(false);
  err = signal('');

  status = signal<Status>('DEMANDEE');

  // ✅ IMPORTANT: ngModel ne peut pas binder sur signal() => variable simple
  q = '';

  items = signal<ExplorationRequestDto[]>([]);

  filtered = computed(() => {
    const query = (this.q || '').trim().toLowerCase();
    const rows = this.items();

    if (!query) return rows;

    return rows.filter((r) => {
      const patient = (r.patientNom || '').toLowerCase();
      const admission = String(r.admissionId || '');
      const types = (r.explorations || []).join(' ').toLowerCase();
      const note = (r.note || '').toLowerCase();
      return patient.includes(query) || admission.includes(query) || types.includes(query) || note.includes(query);
    });
  });

  constructor(private api: ExplorationAgentService, private router: Router,
    private http: HttpClient,
    public auth: AuthService) {
    this.load();
  }

  statusLabel(s: Status) {
    const map: Record<Status, string> = {
      DEMANDEE: 'Demandées',
      EN_COURS: 'En cours',
      TERMINEE: 'Terminées',
    };
    return map[s] ?? s;
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

  setStatus(s: Status) {
    this.status.set(s);
    this.load();
  }

  load() {
    this.err.set('');
    this.loading.set(true);

    this.api.list(this.status()).subscribe({
      next: (rows) => {
        this.items.set(rows || []);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.err.set(e?.error?.message || "Impossible de charger la liste des explorations.");
      },
    });
  }

  open(r: ExplorationRequestDto) {
    this.router.navigate(['/explorations/agent', r.id]);
  }

  refresh() {
    this.load();
  }

logout() {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
}
