import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { api } from '../../../core/api/http';

import { ExplorationService, CreateExplorationRequest } from '../../../services/exploration.service';
import { AuthService } from '../../../services/auth.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
(pdfMake as any)['vfs'] = (pdfFonts as any)['vfs'];

type AdmissionLite = { patientNom?: string; patientId?: number; lit?: string };

@Component({
  standalone: true,
  selector: 'app-exploration-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './exploration-form.component.html',
  styleUrls: ['./exploration-form.component.css'],
})
export class ExplorationFormComponent {
  loading = signal(false);
  err = signal('');

  admissionId!: number;

  private a = api();

  patientNom = '';
  patientId?: number;

  username = '';

  logoLeft: string | null = null;
  logoRight: string | null = null;


  // ✅ types disponibles (ce sont les valeurs stockées dans model.explorations)
  types = [
    'RADIO THORAX',
    'ECHO CARDIOGRAPHIE TRANSTHORACIQUE',
    'ECHODOPPLER ARTERIEL',
    'ECHODOPPLER VEINEUX',
    'ECG',
    'HOLTER RYTHMIQUE',
    'HOLTER ECG',
    'EPREUVE D EFFORT',
    'CORO',
  ];

  // ✅ modèle (multi choix)
  model = {
    explorations: [] as string[],
    urgence: 'NORMAL' as 'NORMAL' | 'URGENT',
    note: '',
    // optionnel: si tu veux l’afficher dans le PDF
    admissionId: undefined as number | undefined,
  };

  // ✅ Tarifs par libellé (doit matcher les valeurs de "types")
  private PRICE_BY_LABEL: Record<string, number> = {
    'RADIO THORAX': 2000,
    'ECHO CARDIOGRAPHIE': 8000,
    'ECHODOPPLER ARTERIEL': 6000,
    'ECHODOPPLER VEINEUX': 6000,
    'HALTER RYTHMIQUE': 5000,
    'HALTER ECG': 4000,
    'EPREUVE DEFFORT': 4000,
    'CORO': 25000,
  };

  // ✅ Logo (mettre ton fichier ici: src/assets/cmc-logo.png)
  private logoDataUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public auth: AuthService,
    private explorationService: ExplorationService
  ) {
    const qp = this.route.snapshot.queryParamMap.get('admissionId');
    const id = qp ? Number(qp) : NaN;

    if (!id || Number.isNaN(id)) {
      this.err.set('AdmissionId manquant dans l’URL. Exemple: /explorations/new?admissionId=12');
      return;
    }

    this.username = this.auth.getUsername() ?? '';

    console.log('this.username   --   ',this.username);

    this.admissionId = id;
    this.model.admissionId = id;

    // 🔎 Charger patientNom pour la facture + affichage
    this.loadAdmission(this.admissionId);
  }

  // ====== UI helpers ======

  labelType(t: string) {
    // Tu peux adapter ici si tu veux des libellés différents
    const map: Record<string, string> = {
      CORO: 'Coronarographie',
    };
    return map[t] ?? t;
  }

  toggleExploration(t: string, checked: boolean) {
    this.model.explorations = this.model.explorations || [];
    if (checked) {
      if (!this.model.explorations.includes(t)) this.model.explorations.push(t);
    } else {
      this.model.explorations = this.model.explorations.filter((x) => x !== t);
    }
  }

  // ====== PDF Facture ======



async generateInvoicePdf() {
  this.err.set('');

  try {
    const chosen = this.model.explorations ?? [];
    if (!chosen.length) {
      this.err.set('Sélectionne au moins une exploration.');
      return;
    }

    // ✅ tente de charger le logo (si ça échoue, on continue sans logo)
    try {
    //  await this.ensureLogoLoaded();
      await this.ensureLogosLoaded();
    } catch (e) {
      console.warn('Logo CMC non chargé (on continue sans logo).', e);
      this.logoDataUrl = null;
    }

    const dateStr = this.todayISO();
    const invoiceNo = 'FAC-' + Date.now();

    const rows = chosen.map((lbl) => {
      const price = this.PRICE_BY_LABEL[lbl] ?? 0;
      const pretty = this.labelType(lbl);
      return [pretty, '1', this.money(price), this.money(price)];
    });

    const total = chosen.reduce((s, lbl) => s + (this.PRICE_BY_LABEL[lbl] ?? 0), 0);

    const urgenceLabel = this.model.urgence === 'URGENT' ? 'Urgent' : 'Normal';
    const note = (this.model.note ?? '').trim();
    const patient = this.patientNom || '—';

    const doc: any = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          columns: [
            this.logoLeft
              ? { image: this.logoLeft, width: 60 }
              : { text: '' },

            [
              { text: 'CMC', alignment: 'center', bold: true, fontSize: 16 },
              { text: 'Centre Militaire de Cardiologie', alignment: 'center' },
              { text: `Facture N°: ${invoiceNo}`, alignment: 'center' },
              { text: `Date: ${dateStr}`, alignment: 'center' },
            ],

            this.logoRight
              ? { image: this.logoRight, width: 140, alignment: 'right' }
              : { text: '' },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 12],
        },

        { text: 'FACTURE — Explorations', style: 'h1' },

      //  { text: `Admission: #${this.admissionId}`, margin: [0, 0, 0, 4] },
        { text: `Docteur: ${this.username}`, margin: [0, 0, 0, 4] },
        { text: `Patient: ${this.patientNom}`, margin: [0, 0, 0, 4] },
      //  { text: `Urgence: ${urgenceLabel}`, margin: [0, 0, 0, 8] },

        note ? { text: `Motif / Note: ${note}`, margin: [0, 0, 0, 10] } : { text: ' ', margin: [0, 0, 0, 6] },

        {
          table: {
            headerRows: 1,
            widths: ['*', 40, 80, 90],
            body: [['Acte / Examen', 'Qté', 'PU', 'Total'], ...rows],
          },
        },

        { text: ' ', margin: [0, 10] },

        {
          columns: [
            { text: '' },
            {
              width: 240,
              table: {
                widths: ['*', 100],
                body: [[{ text: 'TOTAL', bold: true }, { text: this.money(total), bold: true }]],
              },
              layout: 'lightHorizontalLines',
            },
          ],
        },

        { text: ' ', margin: [0, 14] },
        { text: 'Signature: ______________________', alignment: 'right' },
      ],
      styles: {
        h1: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      },
      defaultStyle: { fontSize: 11 },
    };

    // ✅ popup-safe: download (toujours fonctionne)
    pdfMake.createPdf(doc).download(`${invoiceNo}.pdf`);

    // Si tu veux absolument "open", tu peux tester :
    // pdfMake.createPdf(doc).open();

  } catch (e: any) {
    console.error(e);
    this.err.set(e?.message || 'Erreur génération PDF (voir console).');
  }
}


private async ensureLogosLoaded() {
  if (this.logoLeft && this.logoRight) return;

  const leftBlob = await firstValueFrom(
    this.http.get('cmc-logo.png', { responseType: 'blob' })
  );

  const rightBlob = await firstValueFrom(
    this.http.get('etatMajor-logo.png', { responseType: 'blob' })
  );

  this.logoLeft = await this.blobToDataURL(leftBlob);
  this.logoRight = await this.blobToDataURL(rightBlob);
}

  private async ensureLogoLoaded() {
    if (this.logoDataUrl) return;
    // ⚠️ Fichier à mettre: src/assets/cmc-logo.png
    const blob = await firstValueFrom(
      this.http.get('assets/cmc-logo.png', { responseType: 'blob' })
    );
    this.logoDataUrl = await this.blobToDataURL(blob);
  }


  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  // ====== API ======

  private loadAdmission(admissionId: number) {
    this.http.get<AdmissionLite>(`${this.a.base}/admissions/${admissionId}`).subscribe({
      next: (a) => {

        console.log('testtt a?.patientNom--  ',a?.patientNom);
        this.patientNom = a?.patientNom ?? '';
        this.patientId = a?.patientId ?? undefined;
      },
      error: () => {
        // pas bloquant
      },
    });
  }

  save() {
    this.err.set('');

    if (!this.admissionId) {
      this.err.set('AdmissionId manquant.');
      return;
    }

    if (!this.model.explorations || this.model.explorations.length === 0) {
      this.err.set('Sélectionne au moins une exploration.');
      return;
    }

    const payload: CreateExplorationRequest = {
      admissionId: this.admissionId,
      patientNom: this.patientNom || undefined,
      explorations: this.model.explorations,
      urgence: this.model.urgence,
      note: (this.model.note || '').trim(),
    };

    this.loading.set(true);
    this.explorationService.create(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/admissions');
      },
      error: (e) => {
        this.loading.set(false);
        this.err.set(e?.error?.message || 'Erreur lors de la création de la demande.');
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private todayISO() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

 private money(x: number) {
   const s = Number(x || 0).toLocaleString('fr-FR');
   // remplace espace fine insécable + espace insécable par espace normal
   const clean = s.replace(/[\u202F\u00A0]/g, ' ');
   return `${clean} MRU`;
 }
}
