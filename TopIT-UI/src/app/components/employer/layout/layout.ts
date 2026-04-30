import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployerSidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-employer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, EmployerSidebarComponent],
  template: `
    <div class="employer-layout">
      <!-- Sidebar -->
      <app-employer-sidebar></app-employer-sidebar>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Header -->
        <header class="employer-header d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
          <div class="header-search">
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control bg-light border-0" placeholder="Tìm kiếm ứng viên, tin đăng...">
            </div>
          </div>
          
          <div class="header-actions d-flex align-items-center gap-3">
            <button class="btn btn-light position-relative rounded-circle p-2">
              <i class="bi bi-bell"></i>
              <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
            </button>
            <div class="user-profile d-flex align-items-center gap-2" style="cursor: pointer;">
              <div class="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                {{ userInitials() }}
              </div>
              <div class="user-info d-none d-md-block">
                <div class="fw-bold small">{{ userName() }}</div>
                <div class="text-muted smallest">Nhà tuyển dụng</div>
              </div>
              <i class="bi bi-chevron-down small text-muted"></i>
            </div>
          </div>
        </header>

        <!-- Content Outlet -->
        <main class="content-wrapper p-4 p-md-5">
           <router-outlet></router-outlet>
        </main>
      </div>

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
    .employer-layout {
      display: flex;
      background: #f8fafc;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .employer-header {
      height: 70px;
      z-index: 10;
      
      .header-search {
        max-width: 400px;
        width: 100%;
        
        .input-group-text, .form-control {
          background-color: #f1f5f9 !important;
        }
        .form-control:focus {
          box-shadow: none;
          background-color: #e2e8f0 !important;
        }
      }
      
      .smallest {
        font-size: 0.75rem;
      }
    }

    .content-wrapper {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class EmployerLayoutComponent implements OnInit {
  showWelcomeModal = false;
  userName = signal<string>('Employer User');
  userInitials = signal<string>('EU');

  ngOnInit() {
    this.checkFirstLogin();
    this.loadUserInfo();
  }

  loadUserInfo() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const nameClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['Email'] || 'Employer User';
        this.userName.set(nameClaim);
        
        // Tạo Initials (2 chữ cái đầu)
        const parts = nameClaim.split(' ').filter((p: string) => p.length > 0);
        let init = '';
        if (parts.length >= 2) {
          init = parts[0][0] + parts[parts.length - 1][0];
        } else if (parts.length === 1) {
          init = parts[0].substring(0, 2);
        } else {
          init = 'EU';
        }
        this.userInitials.set(init.toUpperCase());

      } catch (e) {
        console.error('Error decoding token for user info', e);
      }
    }
  }

  checkFirstLogin() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const companyId = payload['CompanyId'];

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
