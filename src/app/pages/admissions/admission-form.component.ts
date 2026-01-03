import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Admission } from '../../models/admission.model';
import { AdmissionService } from '../../services/admission.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h2 style="margin:0;">{{ isEdit() ? 'Modifier admission' : 'Nouvelle admission' }}</h2>
    <a routerLink="/admissions">← Retour</a>
  </div>

  <div style="margin-top:14px; display:grid; gap:12px; grid-template-columns: 1fr 1fr;">
    <div>
      <label>Patient ID</label>
      <input type="number" [(ngModel)]="model.patientId"
        style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
    </div>

    <div>
      <label>Date entrée</label>
      <input type="datetime-local" [(ngModel)]="model.dateEntree"
        style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
    </div>

    <div style="grid-column: 1 / -1;">
      <label>Motif (liste de 8 pathologies)</label>
      <select [(ngModel)]="model.motif" style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;">
        <option *ngFor="let m of motifs" [value]="m">{{ m }}</option>
      </select>
    </div>

    <div style="grid-column: 1 / -1;">
      <label>Histoire de la maladie</label>
      <textarea [(ngModel)]="model.histoireMaladie" rows="5"
        style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;"></textarea>
    </div>
  </div>

  <div style="margin-top:14px; display:flex; gap:10px;">
    <button (click)="save()" style="padding:10px 14px; border-radius:10px; border:1px solid #111827; background:#111827; color:white;">
      Enregistrer
    </button>
    <span *ngIf="err()" style="color:#b91c1c;">{{ err() }}</span>
  </div>
  `,
})
export class AdmissionFormComponent {
  isEdit = signal(false);
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
      this.admissionService.get(this.id).subscribe(a => (this.model = a));
    }
  }

  save() {
    this.err.set('');
    if (!this.model.patientId || !this.model.motif) {
      this.err.set('Patient ID et Motif obligatoires.');
      return;
    }

    const req = this.isEdit() && this.id
      ? this.admissionService.update(this.id, this.model)
      : this.admissionService.create(this.model);

    req.subscribe({
      next: () => this.router.navigateByUrl('/admissions'),
      error: () => this.err.set('Erreur enregistrement. Vérifie backend / CORS.'),
    });
  }
}
