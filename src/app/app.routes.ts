import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { roleGuard } from './guards/role.guard';
import { ExplorationFormComponent } from './pages/explorations/exploration-form/exploration-form.component';
import { ExplorationDetailComponent } from './pages/explorations/exploration-detail/exploration-detail.component';
import { ExplorationAgentDashboardComponent } from './pages/explorations/exploration-agent-dashboard/exploration-agent-dashboard.component';
//import { LabFormComponent } from './pages/lab/lab-form.component';
// si le fichier est dans un sous-dossier lab-form/
import { LabFormComponent } from './pages/lab/lab-form/lab-form.component';
import { LabDashboardComponent } from './pages/lab/lab-dashboard/lab-dashboard.component';
import { LabRequestComponent } from './pages/lab/lab-request/lab-request.component';
import { LabFillComponent } from './pages/lab/lab-fill/lab-fill.component';


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

      // Labo / Radio / Pharmacie
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

      { path: 'explorations/new', component: ExplorationFormComponent },
      { path: 'explorations/agent/:id', component: ExplorationDetailComponent },
      { path: 'explorations/agent', component: ExplorationAgentDashboardComponent },
      { path: 'explorations/agent/:id', component: ExplorationDetailComponent },

      { path: 'lab/:admissionId', component: LabFormComponent },

      { path: 'lab', component: LabDashboardComponent },
      { path: 'lab/:admissionId', component: LabFormComponent },


     { path: 'lab/request/:admissionId', component: LabRequestComponent },
     { path: 'lab/orders/:orderId', component: LabFillComponent },

    // { path: 'lab/orders/:orderId', loadComponent: () => import('./pages/lab/lab-fill.component').then(m => m.LabFillComponent) },


    ],
  },

  // Global fallback
  { path: '**', redirectTo: 'login' },
];
