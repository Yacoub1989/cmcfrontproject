import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'patients', pathMatch: 'full' },

      { path: 'patients', loadComponent: () => import('./pages/patients/patient-list.component').then(m => m.PatientListComponent) },
      { path: 'patients/new', loadComponent: () => import('./pages/patients/patient-form.component').then(m => m.PatientFormComponent) },
      { path: 'patients/:id/edit', loadComponent: () => import('./pages/patients/patient-form.component').then(m => m.PatientFormComponent) },

      { path: 'admissions', loadComponent: () => import('./pages/admissions/admission-list.component').then(m => m.AdmissionListComponent) },
      { path: 'admissions/new', loadComponent: () => import('./pages/admissions/admission-form.component').then(m => m.AdmissionFormComponent) },
      { path: 'admissions/:id',loadComponent: () => import('./pages/admissions/admission-view.component').then(m => m.AdmissionViewComponent)},
      { path: 'admissions/:id/edit', loadComponent: () => import('./pages/admissions/admission-form.component').then(m => m.AdmissionFormComponent) },

      { path: 'beds', loadComponent: () => import('./pages/beds/bed-dashboard.component').then(m => m.BedDashboardComponent) },
    ],
  },
  { path: '**', redirectTo: 'patients' },
];
