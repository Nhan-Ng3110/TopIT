import { Routes } from '@angular/router';
import { JobListComponent } from '../app/components/job-list/job-list';
import { LoginComponent } from '../app/components/login/login';
import { RegisterComponent } from '../app/components/register/register';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { ProfileComponent } from './components/profile/profile';
import { CvManagementComponent } from './components/cv-management/cv-management';
import { JobDetailComponent } from './components/job-detail/job-detail';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { ForbiddenComponent } from './components/forbidden/forbidden';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' }, 
  { path: 'jobs', component: JobListComponent },
  { path: 'job/:id', component: JobDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forbidden', component: ForbiddenComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'cv-management', component: CvManagementComponent, canActivate: [authGuard] },
  { path: 'my-cvs', redirectTo: 'cv-management', pathMatch: 'full' },
  { path: 'applied-jobs', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard] },

  // Recruitment & Employer routes
  { path: 'recruitment', loadComponent: () => import('./components/recruitment-landing/recruitment-landing').then(m => m.RecruitmentLandingComponent) },
  { path: 'thank-you', loadComponent: () => import('./components/recruitment-landing/thank-you/thank-you').then(m => m.ThankYouComponent) },

  // Admin routes - protected by adminGuard (Role = "Admin" only)
  { 
    path: 'admin/consultation-requests', 
    loadComponent: () => import('./components/admin/consultation-requests/consultation-requests').then(m => m.ConsultationRequestsComponent),
    canActivate: [adminGuard]
  },

  { 
    path: 'employer', 
    loadComponent: () => import('./components/employer/layout/layout').then(m => m.EmployerLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/job-list/job-list').then(m => m.JobListComponent) },
      { path: 'jobs', loadComponent: () => import('./components/employer/jobs/jobs').then(m => m.EmployerJobsComponent) },
      { path: 'candidates', loadComponent: () => import('./components/employer/candidates/candidates').then(m => m.EmployerCandidatesComponent) },
      { path: 'company', loadComponent: () => import('./components/employer/company/company').then(m => m.CompanyProfileComponent) }
    ]
  }
];