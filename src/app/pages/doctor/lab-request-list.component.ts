import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LabService } from '../../services/lab.service';
import { LabRequest } from '../../models/lab-request.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lab-request-list.component.html',
  styleUrls: ['./lab-request-list.component.css'],
})
export class DoctorLabRequestListComponent {
  data = signal<LabRequest[]>([]);
  rows = computed(() => this.data());

  constructor(private lab: LabService) {
    this.lab.list(undefined, true).subscribe({
      next: (res) => this.data.set(res),
      error: () => this.data.set([]),
    });
  }
}
