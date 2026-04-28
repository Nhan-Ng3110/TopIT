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

      <!-- Welcome Modal -->
      <div class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);" *ngIf="showWelcomeModal">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
            <div class="row g-0">
              <div class="col-md-5 d-flex align-items-center justify-content-center p-4" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);">
                <i class="bi bi-rocket-takeoff" style="font-size: 6rem; color: rgba(255,255,255,0.9);"></i>
              </div>
              <div class="col-md-7 p-5 position-relative">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-4" aria-label="Close" (click)="closeWelcomeModal()"></button>
                <h3 class="fw-bold mb-3">Chào mừng Nhà tuyển dụng!</h3>
                <p class="text-muted mb-4">
                  Cảm ơn bạn đã lựa chọn TopIT. Để bắt đầu đăng tin tuyển dụng và tìm kiếm ứng viên tài năng, bạn cần hoàn thiện <b>Hồ sơ Công ty</b> (Company Profile).
                </p>
                <div class="d-grid gap-2">
                  <a routerLink="/employer/company" class="btn btn-primary btn-lg" (click)="closeWelcomeModal()">
                    <i class="bi bi-building me-2"></i> Thiết lập ngay
                  </a>
                  <button type="button" class="btn btn-light" (click)="closeWelcomeModal()">
                    Để sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
export class EmployerDashboardComponent {
  showWelcomeModal = false;

  constructor() {
    this.checkFirstLogin();
  }

  checkFirstLogin() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const companyId = payload['CompanyId'];

        // If User is Employer but CompanyId is null/missing -> they need to complete profile
        if (role === 'Employer' && !companyId) {
          this.showWelcomeModal = true;
        }
      } catch (e) {
        console.error('Error decoding token for welcome modal', e);
      }
    }
  }

  closeWelcomeModal() {
    this.showWelcomeModal = false;
  }
}
