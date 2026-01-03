import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { Admission } from '../../models/admission.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h2 style="margin:0;">Admissions</h2>
    <a routerLink="/admissions/new" style="padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; text-decoration:none;">
      + Nouvelle admission
    </a>
  </div>

  <div style="margin-top:12px; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
    <table style="width:100%; border-collapse:collapse;">
      <thead style="background:#f9fafb;">
        <tr>
          <th style="text-align:left; padding:10px;">ID</th>
          <th style="text-align:left; padding:10px;">PatientId</th>
          <th style="text-align:left; padding:10px;">Motif</th>
          <th style="text-align:left; padding:10px;">Date</th>
          <th style="padding:10px;"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let a of admissions()" style="border-top:1px solid #eef2f7;">
          <td style="padding:10px;">{{ a.id }}</td>
          <td style="padding:10px;">{{ a.patientId }}</td>
          <td style="padding:10px;">{{ a.motif }}</td>
          <td style="padding:10px;">{{ a.dateEntree || '-' }}</td>
          <td style="padding:10px; text-align:right;">
            <a [routerLink]="['/admissions', a.id, 'edit']">Modifier</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
})
export class AdmissionListComponent {
  admissions = signal<Admission[]>([]);

  constructor(private admissionService: AdmissionService) {
    this.admissionService.list().subscribe({
      next: (res) => this.admissions.set(res),
      error: () => this.admissions.set([]),
    });
  }
}
