import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type Param = { code: string; label: string };

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lab-request.component.html',
  styleUrls: ['./lab-request.component.css'],
})
export class LabRequestComponent {
  admissionId!: number; // ✅ ici seulement la déclaration
  msg = '';

  readonly PARAMS: Param[] = [
    { code: 'GLYCEMIE', label: 'Glycémie' },
    { code: 'UREE', label: 'Urée' },
    { code: 'CREATININE', label: 'Créatinine' },
    { code: 'SODIUM', label: 'Sodium' },
    { code: 'POTASSIUM', label: 'Potassium' },
    { code: 'CHLORE', label: 'Chlore' },
    { code: 'CRP', label: 'CRP' },
    { code: 'TROPONINE', label: 'Troponine' },
    { code: 'HEMOGLOBINE', label: 'Hémoglobine' },
    { code: 'LEUCOCYTES', label: 'Leucocytes' },
    { code: 'PLAQUETTES', label: 'Plaquettes' },
    { code: 'INR', label: 'INR' },
    { code: 'TCA', label: 'TCA' },
    { code: 'ASAT', label: 'ASAT' },
    { code: 'ALAT', label: 'ALAT' },
  ];

  form = new FormGroup({
    checks: new FormArray<FormControl<boolean>>(
      this.PARAMS.map(() => new FormControl<boolean>(false, { nonNullable: true }))
    ),
  });

  get checks(): FormArray<FormControl<boolean>> {
    return this.form.get('checks') as FormArray<FormControl<boolean>>;
  }

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    // ✅ ici seulement
    this.admissionId = Number(this.route.snapshot.paramMap.get('admissionId'));
  }

  submit() {
    const selected = this.PARAMS
      .filter((_, i) => this.checks.at(i).value === true)
      .map((p) => p.code);

    if (selected.length === 0) {
      this.msg = 'Choisis au moins 1 paramètre.';
      return;
    }

    const dto = { admissionId: this.admissionId, params: selected };

    this.http.post('http://localhost:7777/api/lab/orders', dto).subscribe({
      next: () => {
        this.msg = 'Demande envoyée ✅';
        setTimeout(() => this.router.navigate(['/admissions', this.admissionId]), 300);
      },
      error: () => (this.msg = 'Erreur ❌'),
    });
  }
}
