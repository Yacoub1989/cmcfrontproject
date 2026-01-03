import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BedService } from '../../services/bed.service';
import { Bed } from '../../models/bed.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <h2 style="margin:0;">Beds dashboard</h2>

  <div style="margin-top:12px; display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
    <div class="kpi">Total<br><b>{{ beds().length }}</b></div>
    <div class="kpi">Disponibles<br><b>{{ kpiDisponible() }}</b></div>
    <div class="kpi">Occupés<br><b>{{ kpiOccupe() }}</b></div>
    <div class="kpi">Hors service<br><b>{{ kpiHS() }}</b></div>
  </div>

  <div style="margin-top:12px; display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
    <div *ngFor="let b of beds()" class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:700;">{{ b.code }}</div>
        <span class="badge">{{ b.status }}</span>
      </div>

      <div style="margin-top:8px; color:#374151;">
        <div *ngIf="b.service">Service: {{ b.service }}</div>

        <div *ngIf="b.status === 'OCCUPE'">
          Patient: <b>{{ b.patientNom }} {{ b.patientPrenom }}</b><br>
          Admission: {{ b.admissionId }}<br>
          Sortie estimée: {{ b.dateSortieEstimee || '-' }}
        </div>

        <div *ngIf="b.status !== 'OCCUPE'">—</div>
      </div>
    </div>
  </div>

  <style>
    .kpi{border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff;}
    .card{border:1px solid #e5e7eb; border-radius:14px; padding:12px; background:#fff;}
    .badge{font-size:12px; border:1px solid #e5e7eb; padding:4px 8px; border-radius:999px;}
  </style>
  `,
})
export class BedDashboardComponent {
  beds = signal<Bed[]>([]);

  kpiDisponible = computed(() => this.beds().filter(b => b.status === 'DISPONIBLE').length);
  kpiOccupe = computed(() => this.beds().filter(b => b.status === 'OCCUPE').length);
  kpiHS = computed(() => this.beds().filter(b => b.status === 'HORS_SERVICE').length);

  constructor(private bedService: BedService) {
    this.bedService.dashboard().subscribe({
      next: (res) => this.beds.set(res),
      error: () => this.beds.set([]),
    });
  }
}
