import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div style="display:flex; min-height:100vh; font-family: system-ui;">
    <aside style="width:220px; padding:16px; border-right:1px solid #e5e7eb;">
      <div style="font-weight:700; margin-bottom:16px;">CMC</div>

      <a routerLink="/patients" routerLinkActive="active" class="nav">Patients</a>
      <a routerLink="/admissions" routerLinkActive="active" class="nav">Admissions</a>
      <a routerLink="/beds" routerLinkActive="active" class="nav">Beds dashboard</a>
      <a routerLink="/doctor" routerLinkActive="active" class="nav">Dashboard docteur</a>
      <a routerLink="/explorations/agent" routerLinkActive="active" class="nav">Dashboard explorations</a>
      <a routerLink="/lab" routerLinkActive="active" class="nav">Dashboard laboratoire</a>

      <style>
        .nav{display:block; padding:10px 12px; border-radius:10px; text-decoration:none; color:#111827; margin-bottom:6px;}
        .active{background:#eef2ff;}
      </style>
    </aside>

    <main style="flex:1; padding:18px;">
      <router-outlet></router-outlet>
    </main>
  </div>
  `,
})
export class ShellComponent {}
