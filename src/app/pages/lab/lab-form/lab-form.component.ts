import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LabService } from '../../../services/lab.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';


@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lab-form.component.html',
  styleUrls: ['./lab-form.component.css'],
})
export class LabFormComponent {
  admissionId!: number;   // ✅ pas calculé ici
  msg = '';

  form = new FormGroup({
    glycemie: new FormControl<number | null>(null),
    uree: new FormControl<number | null>(null),
    creatinine: new FormControl<number | null>(null),
    sodium: new FormControl<number | null>(null),
    potassium: new FormControl<number | null>(null),
    chlore: new FormControl<number | null>(null),
    crp: new FormControl<number | null>(null),
    troponine: new FormControl<number | null>(null),
    hemoglobine: new FormControl<number | null>(null),
    leucocytes: new FormControl<number | null>(null),
    plaquettes: new FormControl<number | null>(null),
    inr: new FormControl<number | null>(null),
    tca: new FormControl<number | null>(null),
    asat: new FormControl<number | null>(null),
    alat: new FormControl<number | null>(null),
  });

  constructor(private route: ActivatedRoute, private lab: LabService, public auth: AuthService, private router: Router) {
    this.admissionId = Number(this.route.snapshot.paramMap.get('admissionId'));

    // charger résultat s'il existe
    this.lab.get(this.admissionId).subscribe({
      next: (r) => this.form.patchValue(r),
      error: () => {},
    });
  }

  save() {
    this.msg = '';
    const dto = { admissionId: this.admissionId, ...this.form.value };

    this.lab.save(dto).subscribe({
      next: () => (this.msg = 'Enregistré ✅'),
      error: () => (this.msg = 'Erreur ❌'),
    });
  }

logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
