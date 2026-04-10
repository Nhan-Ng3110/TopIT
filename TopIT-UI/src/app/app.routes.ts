import { Routes } from '@angular/router';
import { JobListComponent } from '../app/components/job-list/job-list';
import { LoginComponent } from '../app/components/login/login'; // Import file login vào
import { RegisterComponent } from '../app/components/register/register'; // Import file register vào

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' }, // Mặc định vào trang jobs
  { path: 'jobs', component: JobListComponent },       // Trang danh sách công việc
  { path: 'login', component: LoginComponent },         // Đường dẫn mới: trang Đăng nhập
  { path: 'register', component: RegisterComponent }
];