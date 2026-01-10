import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabService } from '../../services/lab.service';
import { LabRequest } from '../../models/lab-request.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lab-request-detail.component.html',
  styleUrls: ['./lab-request-detail.component.css'],
})
export class LabRequestDetailComponent {
  loading = signal(false);
  err = signal('');
  req = signal<LabRequest | null>(null);

  resultText = '';
  resultValuesJson = '';

  private id = 0;

  constructor(private route: ActivatedRoute, private lab: LabService) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);

    this.lab.get(this.id).subscribe({
      next: (r) => {
        this.req.set(r);
        this.resultText = r.resultText ?? '';
        this.resultValuesJson = r.resultValuesJson ?? '';
      },
      error: () => this.err.set('Impossible de charger la demande.'),
    });
  }

  start() {
    this.err.set('');
    this.loading.set(true);
    this.lab.start(this.id).subscribe({
      next: (r) => { this.req.set(r); this.loading.set(false); },
      error: () => { this.err.set('Erreur start.'); this.loading.set(false); },
    });
  }

  done() {
    this.err.set('');
    this.loading.set(true);
    this.lab.done(this.id, {
      resultText: this.resultText,
      resultValuesJson: this.resultValuesJson,
    }).subscribe({
      next: (r) => { this.req.set(r); this.loading.set(false); },
      error: () => { this.err.set('Erreur validation.'); this.loading.set(false); },
    });
  }
}
