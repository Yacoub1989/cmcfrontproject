import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient, IdentiteType } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h2 style="margin:0;">{{ isEdit() ? 'Modifier patient' : 'Nouveau patient' }}</h2>
    <a routerLink="/patients">← Retour</a>
  </div>

  <div style="margin-top:14px; display:grid; gap:12px; grid-template-columns: 1fr 1fr;">
    <div>
      <label>NNI</label>
      <div style="display:flex; gap:8px;">
        <input [(ngModel)]="model.nni" style="flex:1; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
        <button (click)="verify()" type="button" style="padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; background:white;">
          Vérifier
        </button>
      </div>
      <div *ngIf="verifyMsg()" style="margin-top:6px; color:#374151;">{{ verifyMsg() }}</div>
    </div>

    <div>
      <label>Type identité</label>
      <select [(ngModel)]="model.typeIdentite" style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;">
        <option value="CIVILE">CIVILE</option>
        <option value="MILITAIRE">MILITAIRE</option>
      </select>
    </div>

    <div>
      <label>Nom</label>
      <input [(ngModel)]="model.nom" style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
    </div>

    <div>
      <label>Prénom</label>
      <input [(ngModel)]="model.prenom" style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
    </div>

    <div>
      <label>Date naissance</label>
      <input type="date" [(ngModel)]="model.dateNaissance" style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
    </div>

    <div>
      <label>Téléphone</label>
      <input [(ngModel)]="model.telephone" style="width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;" />
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
export class PatientFormComponent {
  isEdit = signal(false);
  verifyMsg = signal('');
  err = signal('');

  model: Patient = {
    nni: '',
    typeIdentite: 'CIVILE' as IdentiteType,
    nom: '',
    prenom: '',
    dateNaissance: '',
    telephone: '',
  };

  private id?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.id = Number(idParam);
      this.patientService.get(this.id).subscribe(p => (this.model = p));
    }
  }

  verify() {
    this.verifyMsg.set('');
    if (!this.model.nni?.trim()) return this.verifyMsg.set('NNI obligatoire');
    this.patientService.verifyNNI(this.model.nni.trim()).subscribe({
      next: (res) => this.verifyMsg.set(res?.message ?? 'NNI vérifié'),
      error: () => this.verifyMsg.set('Impossible de vérifier (API ANRPTS non dispo ou erreur).'),
    });
  }

  save() {
    this.err.set('');
    if (!this.model.nni?.trim() || !this.model.nom?.trim() || !this.model.prenom?.trim()) {
      this.err.set('NNI, Nom, Prénom obligatoires.');
      return;
    }

    const req = this.isEdit() && this.id
      ? this.patientService.update(this.id, this.model)
      : this.patientService.create(this.model);

    req.subscribe({
      next: () => this.router.navigateByUrl('/patients'),
      error: () => this.err.set('Erreur enregistrement. Vérifie le backend / CORS.'),
    });
  }
}
