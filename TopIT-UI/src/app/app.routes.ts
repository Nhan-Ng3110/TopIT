import { Routes } from '@angular/router';
import { JobListComponent } from '../app/components/job-list/job-list';
import { LoginComponent } from '../app/components/login/login';
import { RegisterComponent } from '../app/components/register/register';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile';
import { CvManagementComponent } from './components/cv-management/cv-management';
import { JobDetailComponent } from './components/job-detail/job-detail';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' }, 
  { path: 'jobs', component: JobListComponent },
  { path: 'job/:id', component: JobDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'cv-management', component: CvManagementComponent, canActivate: [authGuard] },
  { path: 'my-cvs', redirectTo: 'cv-management', pathMatch: 'full' },
  { path: 'applied-jobs', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard] }
];