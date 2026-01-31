import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LabService, LabOrder } from '../../../services/lab.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lab-dashboard.component.html',
})
export class LabDashboardComponent {
  status = signal<'PENDING'|'DONE'>('PENDING');
  items = signal<LabOrder[]>([]);
  loading = signal(false);

  constructor(private lab: LabService, private router: Router) {
    this.load();
  }

  setStatus(s: 'PENDING'|'DONE') {
    this.status.set(s);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.lab.listOrders(this.status()).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.items.set([]); this.loading.set(false); }
    });
  }

goToLabo(id: number) {
    this.router.navigate(['/lab', id]);
  }
}
