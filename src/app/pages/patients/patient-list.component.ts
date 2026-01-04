import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
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
