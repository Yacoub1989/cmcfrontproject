import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { roleGuard } from './guards/role.guard';
import { ExplorationFormComponent } from './pages/explorations/exploration-form/exploration-form.component';
import { ExplorationDetailComponent } from './pages/explorations/exploration-detail/exploration-detail.component';
import { ExplorationAgentDashboardComponent } from './pages/explorations/exploration-agent-dashboard/exploration-agent-dashboard.component';


export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },

      { path: 'login', loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) },
      { path: 'forbidden', loadComponent: () => import('./pages/auth/forbidden.component').then(m => m.ForbiddenComponent) },

      // Doctor
      { path: 'doctor', canActivate: [roleGuard(['ROLE_DOCTEUR','ROLE_ADMIN'])], loadComponent: () => import('./pages/doctor/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'doctor/lab', loadComponent: () => import('./pages/doctor/lab-request-list.component').then(m => m.DoctorLabRequestListComponent) },
      { path: 'doctor/lab/new', loadComponent: () => import('./pages/doctor/lab-request-new.component').then(m => m.DoctorLabRequestNewComponent) },

      // Labo / Radio / Pharmacie
      { path: 'labo', canActivate: [roleGuard(['ROLE_LABO','ROLE_ADMIN'])], loadComponent: () => import('./pages/labo/labo-dashboard.component').then(m => m.LaboDashboardComponent) },
      { path: 'radio', canActivate: [roleGuard(['ROLE_RADIO','ROLE_ADMIN'])], loadComponent: () => import('./pages/radio/radio-dashboard.component').then(m => m.RadioDashboardComponent) },
      { path: 'pharmacie', canActivate: [roleGuard(['ROLE_PHARMACIE','ROLE_ADMIN'])], loadComponent: () => import('./pages/pharmacie/pharmacie-dashboard.component').then(m => m.PharmacieDashboardComponent) },

      // Patients
      { path: 'patients', loadComponent: () => import('./pages/patients/patient-list.component').then(m => m.PatientListComponent) },
      { path: 'patients/new', loadComponent: () => import('./pages/patients/patient-form.component').then(m => m.PatientFormComponent) },
      { path: 'patients/:id/edit', loadComponent: () => import('./pages/patients/patient-form.component').then(m => m.PatientFormComponent) },

      // Admissions
      { path: 'admissions', loadComponent: () => import('./pages/admissions/admission-list.component').then(m => m.AdmissionListComponent) },
      { path: 'admissions/new', loadComponent: () => import('./pages/admissions/admission-form.component').then(m => m.AdmissionFormComponent) },
      { path: 'admissions/:id', loadComponent: () => import('./pages/admissions/admission-view.component').then(m => m.AdmissionViewComponent) },
      { path: 'admissions/:id/edit', loadComponent: () => import('./pages/admissions/admission-form.component').then(m => m.AdmissionFormComponent) },

      // Beds
      { path: 'beds', loadComponent: () => import('./pages/beds/bed-dashboard.component').then(m => m.BedDashboardComponent) },

      // Labo queue details
      { path: 'labo/queue', loadComponent: () => import('./pages/labo/lab-queue.component').then(m => m.LabQueueComponent) },
      { path: 'labo/requests/:id', loadComponent: () => import('./pages/labo/lab-request-detail.component').then(m => m.LabRequestDetailComponent) },

      { path: 'explorations/new', component: ExplorationFormComponent },
      { path: 'explorations/agent/:id', component: ExplorationDetailComponent },
      { path: 'explorations/agent', component: ExplorationAgentDashboardComponent },
      { path: 'explorations/agent/:id', component: ExplorationDetailComponent },
    ],
  },

  // Global fallback
  { path: '**', redirectTo: 'login' },
];
