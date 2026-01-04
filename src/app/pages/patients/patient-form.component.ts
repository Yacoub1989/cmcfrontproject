import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type TypeIdentite = 'CIVILE' | 'MILITAIRE';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css'],
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;

  isEdit = false;
  patientId?: number;

  form = this.fb.group({
    nni: [''],
    typeIdentite: ['CIVILE' as TypeIdentite, Validators.required],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    dateNaissance: [''], // yyyy-MM-dd
    telephone: [''],
  });

  // ✅ adapte si besoin
  private API_BASE = 'http://localhost:7777/api';

  ngOnInit(): void {
    // ✅ important avec loadComponent + navigation
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');
      console.log('EDIT ROUTE id =', id);

      if (id) {
        this.isEdit = true;
        this.patientId = Number(id);
        this.loadPatient(this.patientId);
      } else {
        this.isEdit = false;
        this.patientId = undefined;
        // si tu veux reset quand /new
        // this.resetForm();
      }
    });
  }

  private async loadPatient(id: number) {
    try {
      this.loading = true;

      const url = `${this.API_BASE}/patients/${id}`;
      console.log('CALLING API:', url);

      const p: any = await this.http.get(url).toPromise();
      console.log('PATIENT LOADED:', p);

      // si backend renvoie "2026-01-04T00:00:00" => garder "2026-01-04"
      const dateOnly = (v?: any) => (v ? String(v).substring(0, 10) : '');

      this.form.patchValue({
        nni: p?.nni ?? '',
        typeIdentite: (p?.typeIdentite ?? 'CIVILE') as TypeIdentite,
        nom: p?.nom ?? '',
        prenom: p?.prenom ?? '',
        dateNaissance: dateOnly(p?.dateNaissance),
        telephone: p?.telephone ?? '',
      });
    } catch (e) {
      console.error('Load patient error:', e);
      this.router.navigate(['/patients']);
    } finally {
      this.loading = false;
    }
  }

  async verifyNNI() {
    const nni = this.form.value.nni?.trim();
    if (!nni) return;

    try {
      this.loading = true;

      const data: any = await this.http
        .get(`${this.API_BASE}/nni/${encodeURIComponent(nni)}`)
        .toPromise();

      this.form.patchValue({
        nom: data?.nom ?? this.form.value.nom ?? '',
        prenom: data?.prenom ?? this.form.value.prenom ?? '',
        telephone: data?.telephone ?? this.form.value.telephone ?? '',
      });
    } catch (e) {
      console.error('NNI not found / error:', e);
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    if (this.isEdit && this.patientId) {
      // en mode edit: reset => recharger les valeurs depuis le serveur
      this.loadPatient(this.patientId);
      return;
    }

    this.form.reset({
      nni: '',
      typeIdentite: 'CIVILE',
      nom: '',
      prenom: '',
      dateNaissance: '',
      telephone: '',
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      ...raw,
      // si ton backend attend LocalDateTime:
      // dateNaissance: raw.dateNaissance ? `${raw.dateNaissance}T00:00:00` : null,
    };

    try {
      this.loading = true;

      if (this.isEdit && this.patientId) {
        // ✅ UPDATE
        await this.http
          .put(`${this.API_BASE}/patients/${this.patientId}`, payload)
          .toPromise();
      } else {
        // ✅ CREATE
        await this.http.post(`${this.API_BASE}/patients`, payload).toPromise();
      }

      this.router.navigate(['/patients']);
    } catch (e) {
      console.error('Save patient error:', e);
    } finally {
      this.loading = false;
    }
  }
}
