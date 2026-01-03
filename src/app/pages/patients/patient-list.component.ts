import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h2 style="margin:0;">Patients</h2>
    <a routerLink="/patients/new" style="padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; text-decoration:none;">
      + Nouveau patient
    </a>
  </div>

  <div style="margin-top:12px;">
    <input [value]="q()" (input)="q.set(($any($event.target)).value)"
      placeholder="Rechercher (nom, nni, tel...)"
      style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
  </div>

  <div style="margin-top:12px; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
    <table style="width:100%; border-collapse:collapse;">
      <thead style="background:#f9fafb;">
        <tr>
          <th style="text-align:left; padding:10px;">Code</th>
          <th style="text-align:left; padding:10px;">NNI</th>
          <th style="text-align:left; padding:10px;">Nom</th>
          <th style="text-align:left; padding:10px;">Type</th>
          <th style="text-align:left; padding:10px;">Téléphone</th>
          <th style="padding:10px;"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of filtered()" style="border-top:1px solid #eef2f7;">
          <td style="padding:10px;">{{ p.codePatient || '-' }}</td>
          <td style="padding:10px;">{{ p.nni }}</td>
          <td style="padding:10px;">{{ p.nom }} {{ p.prenom }}</td>
          <td style="padding:10px;">{{ p.typeIdentite }}</td>
          <td style="padding:10px;">{{ p.telephone || '-' }}</td>
          <td style="padding:10px; text-align:right;">
            <a [routerLink]="['/patients', p.id, 'edit']">Modifier</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
})
export class PatientListComponent {
  q = signal('');
  patients = signal<Patient[]>([]);

  filtered = computed(() => {
    const s = this.q().trim().toLowerCase();
    if (!s) return this.patients();
    return this.patients().filter(p =>
      [p.nni, p.nom, p.prenom, p.telephone, p.codePatient].filter(Boolean).join(' ').toLowerCase().includes(s)
    );
  });

  constructor(private patientService: PatientService) {
    this.patientService.list().subscribe({
      next: (res) => this.patients.set(res),
      error: () => this.patients.set([]),
    });
  }
}
