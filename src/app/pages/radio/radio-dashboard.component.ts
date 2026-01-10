import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './radio-dashboard.component.html',
})
export class RadioDashboardComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
