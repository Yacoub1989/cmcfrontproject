import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LabService } from '../../services/lab.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lab-request-new.component.html',
  styleUrls: ['./lab-request-new.component.css'],
})
export class DoctorLabRequestNewComponent {
  loading = signal(false);
  err = signal('');

  patientId = 0;
  admissionId: number | null = null;
  tests = '';

  constructor(private lab: LabService, private router: Router, private route: ActivatedRoute) {
    // option: /doctor/lab/new?patientId=123&admissionId=5
    const p = this.route.snapshot.queryParamMap.get('patientId');
    const a = this.route.snapshot.queryParamMap.get('admissionId');
    if (p) this.patientId = Number(p);
    if (a) this.admissionId = Number(a);
  }

  submit() {
    this.err.set('');

    if (!this.patientId || this.patientId <= 0) {
      this.err.set('Patient ID obligatoire.');
      return;
    }
    if (!this.tests.trim()) {
      this.err.set('Examens demandés obligatoires.');
      return;
    }

    this.loading.set(true);
    this.lab.create({
      patientId: this.patientId,
      admissionId: this.admissionId,
      tests: this.tests.trim(),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/doctor/lab'); // page liste docteur
      },
      error: (e) => {
        this.loading.set(false);
        console.error(e);
        this.err.set('Erreur création demande (JWT/CORS/Backend).');
      }
    });
  }
}
