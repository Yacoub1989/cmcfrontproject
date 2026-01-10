import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LabService } from '../../services/lab.service';
import { LabRequest } from '../../models/lab-request.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lab-queue.component.html',
  styleUrls: ['./lab-queue.component.css'],
})
export class LabQueueComponent {
  items = signal<LabRequest[]>([]);

  constructor(private lab: LabService) {
    this.lab.list('PENDING').subscribe({
      next: (res) => this.items.set(res),
      error: () => this.items.set([]),
    });
  }
}
