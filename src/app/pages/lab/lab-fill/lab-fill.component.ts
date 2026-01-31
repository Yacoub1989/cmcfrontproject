import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LabService, LabOrderDetails } from '../../../services/lab.service';

const LABELS: Record<string, string> = {
  TROPONINE: 'Troponine',
  PLAQUETTES: 'Plaquettes',
  GLYCEMIE: 'Glycémie',
  UREE: 'Urée',
  CREATININE: 'Créatinine',
  SODIUM: 'Sodium',
  POTASSIUM: 'Potassium',
  CHLORE: 'Chlore',
  CRP: 'CRP',
  HEMOGLOBINE: 'Hémoglobine',
  LEUCOCYTES: 'Leucocytes',
  INR: 'INR',
  TCA: 'TCA',
  ASAT: 'ASAT',
  ALAT: 'ALAT',
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lab-fill.component.html',
  styleUrls: ['./lab-fill.component.css'],
})
export class LabFillComponent implements OnInit {
  orderId!: number;

  loading = true;
  msg = '';
  details: LabOrderDetails | null = null;

  form: FormGroup = new FormGroup({});
  formReady = false;

  constructor(
    private route: ActivatedRoute,
    private lab: LabService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = Number(pm.get('orderId'));
      console.log('🟢 route orderId =', id);

      if (!id) {
        this.zone.run(() => {
          this.msg = 'orderId invalide';
          this.loading = false;
          this.formReady = false;
          this.details = null;
          this.cdr.detectChanges();
        });
        return;
      }

      this.orderId = id;
      this.load();
    });
  }

  label(code: string): string {
    return LABELS[code] ?? code;
  }

  get controlsKeys(): string {
    return Object.keys(this.form?.controls || {}).join(', ');
  }

  private refreshUI() {
    // ✅ force un refresh même si la réponse arrive hors zone Angular (fetch/zoneless/etc.)
    this.cdr.detectChanges();
  }

  load() {
    console.log('📡 load() start, orderId=', this.orderId);

    // reset écran
    this.zone.run(() => {
      this.loading = true;
      this.formReady = false;
      this.msg = '';
      this.details = null;
      this.form = new FormGroup({});
      this.refreshUI();
    });

    this.lab
      .getOrder(this.orderId)
      .pipe(
        finalize(() => {
          // ✅ quoi qu'il arrive, on sort du loading
          this.zone.run(() => {
            console.log('🔚 finalize() → loading=false');
            this.loading = false;
            this.refreshUI();
          });
        })
      )
      .subscribe({
        next: (d) => {
          console.log('✅ getOrder NEXT =', d);

          const paramsRaw = Array.isArray(d.params) ? d.params : [];
          const params = paramsRaw.map((p) => String(p).trim().toUpperCase());

          const group: Record<string, FormControl<number | null>> = {};
          for (const code of params) {
            const v = (d as any).values?.[code] ?? null;
            console.log('➕ control', code, 'val=', v);
            group[code] = new FormControl<number | null>(v);
          }

          // ✅ mettre à jour toutes les données UI dans zone Angular
          this.zone.run(() => {
            this.details = { ...d, params };
            this.form = new FormGroup(group);
            this.formReady = true;

            console.log('🧪 params=', params);
            console.log('🧪 controlsKeys=', Object.keys(this.form.controls));

            this.refreshUI();
          });
        },
        error: (err) => {
          console.error('❌ getOrder ERROR =', err);
          this.zone.run(() => {
            this.msg = 'Impossible de charger la demande.';
            this.formReady = false;
            this.details = null;
            this.refreshUI();
          });
        },
      });
  }

  save() {
    if (!this.details) return;

    const raw = this.form.getRawValue() as Record<string, any>;
    const values: Record<string, number | null> = {};
    for (const [k, v] of Object.entries(raw)) {
      values[k] = v === '' || v === null || v === undefined ? null : Number(v);
    }

    console.log('💾 save payload=', values);

    // Optionnel: petit feedback UI
    this.zone.run(() => {
      this.msg = '';
      this.refreshUI();
    });

    this.lab.saveResults(this.orderId, values).subscribe({
      next: () => {
        this.zone.run(() => {
          this.msg = 'Enregistré ✅';
          this.refreshUI();
        });
        setTimeout(() => this.router.navigate(['/lab']), 300);
      },
      error: (err) => {
        console.error('❌ save error', err);
        this.zone.run(() => {
          this.msg = 'Erreur enregistrement ❌';
          this.refreshUI();
        });
      },
    });
  }

  back() {
    this.router.navigate(['/lab']);
  }
}
