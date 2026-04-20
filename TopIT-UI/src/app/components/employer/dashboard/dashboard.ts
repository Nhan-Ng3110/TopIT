import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployerSidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EmployerSidebarComponent],
  template: `
    <div class="employer-dashboard-layout">
      <app-employer-sidebar></app-employer-sidebar>
      <main class="dashboard-content">
        <div class="content-wrapper p-4 p-md-5">
           <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .employer-dashboard-layout {
      display: flex;
      background: #f8fafc;
      min-height: 100vh;
    }

    .dashboard-content {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
    }

    .content-wrapper {
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class EmployerDashboardComponent {}
