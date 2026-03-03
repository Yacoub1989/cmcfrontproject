import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

type TypeIdentite = 'CIVILE' | 'MILITAIRE';
type TypePatient = 'INTERNE' | 'EXTERNE';



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

  // ✅ adapte si besoin (AWS / local)
  //private API_BASE = 'http://cmc7.eba-phvqmhxm.eu-north-1.elasticbeanstalk.com/api';

  private API_BASE = 'http://localhost:7777/api';

  form = this.fb.group({
    nni: [''],
    typeIdentite: ['CIVILE' as TypeIdentite, Validators.required],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    dateNaissance: [''], // input type="date" => yyyy-MM-dd
    telephone: [''],
    typePatient: ['INTERNE' as TypePatient, Validators.required],
  });

  // ✅ UI helpers
  get pageTitle(): string {
    return this.isEdit ? 'Modifier patient' : 'Nouveau patient';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Mettre à jour' : 'Enregistrer';
  }

  get initials(): string {
    const nom = this.form.value.nom?.trim()?.[0] ?? '';
    const prenom = this.form.value.prenom?.trim()?.[0] ?? '';
    return (nom + prenom).toUpperCase() || 'P';
  }

  ngOnInit(): void {
    // ✅ important avec loadComponent + navigation
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id');

      if (id) {
        this.isEdit = true;
        this.patientId = Number(id);
        if (!Number.isFinite(this.patientId)) {
          this.router.navigate(['/patients']);
          return;
        }
        this.loadPatient(this.patientId);
      } else {
        this.isEdit = false;
        this.patientId = undefined;
        // si tu veux reset quand /new:
        // this.resetForm();
      }
    });
  }

  private async loadPatient(id: number) {
    try {
      this.loading = true;

      const url = `${this.API_BASE}/patients/${id}`;
      const p: any = await this.http.get(url).toPromise();

      // si backend renvoie "2026-01-04T00:00:00" => garder "2026-01-04"
      const dateOnly = (v?: any) => (v ? String(v).substring(0, 10) : '');

      this.form.patchValue({
        nni: p?.nni ?? '',
        typeIdentite: (p?.typeIdentite ?? 'CIVILE') as TypeIdentite,
        nom: p?.nom ?? '',
        prenom: p?.prenom ?? '',
        dateNaissance: dateOnly(p?.dateNaissance),
        telephone: p?.telephone ?? '',
        typePatient: (p?.typePatient ?? 'INTERNE') as TypePatient,
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

      // Remplir automatiquement si trouvé (sans écraser si vide côté API)
      this.form.patchValue({
        nom: data?.nom ?? this.form.value.nom ?? '',
        prenom: data?.prenom ?? this.form.value.prenom ?? '',
        telephone: data?.telephone ?? this.form.value.telephone ?? '',
        // dateNaissance: data?.dateNaissance ? String(data.dateNaissance).substring(0,10) : this.form.value.dateNaissance ?? '',
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
      typePatient: 'INTERNE',
    });
  }

async onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const raw = this.form.getRawValue();

  const payload: any = {
    ...raw,
    // dateNaissance: raw.dateNaissance ? `${raw.dateNaissance}T00:00:00` : null,
  };

  try {
    this.loading = true;

    if (this.isEdit && this.patientId) {
      // ✅ UPDATE => retour liste patients (ou tu peux aller vers admission si tu veux)
      await this.http
        .put(`${this.API_BASE}/patients/${this.patientId}`, payload)
        .toPromise();

      this.router.navigate(['/patients']);
      return;
    }

    // ✅ CREATE => récupérer le patient créé
    const created: any = await this.http
      .post(`${this.API_BASE}/patients`, payload)
      .toPromise();

    const newPatientId = created?.id ?? created?.patientId ?? created?.data?.id;
    const typePatient = (created?.typePatient ?? raw.typePatient) as TypePatient;

    if (!newPatientId) {
      // fallback: si backend ne renvoie pas id
      console.warn('Patient créé mais ID introuvable dans la réponse:', created);
      this.router.navigate(['/patients']);
      return;
    }

    // ✅ Redirection immédiate vers création admission avec patientId pré-rempli
    if(typePatient==='INTERNE') {
    this.router.navigate(['/admissions/new'], { queryParams: { patientId: newPatientId, typePatient } });
    }
  else {
    this.router.navigate(['/patients']);
    }

  } catch (e) {
    console.error('Save patient error:', e);
  } finally {
    this.loading = false;
  }
}


}
