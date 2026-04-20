import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-employer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="employer-sidebar">
      <div class="sidebar-header pb-4 mb-4 border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div class="employer-avatar">
            <i class="bi bi-building"></i>
          </div>
          <div class="employer-info">
            <h6 class="mb-0 fw-bold">Employer Hub</h6>
            <small class="text-muted">Recruitment Pro</small>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/employer/dashboard" routerLinkActive="active" class="nav-item">
          <i class="bi bi-speedometer2"></i>
          <span>Tổng quan</span>
        </a>
        <a routerLink="/employer/jobs" routerLinkActive="active" class="nav-item">
          <i class="bi bi-briefcase"></i>
          <span>Tin tuyển dụng</span>
        </a>
        <a routerLink="/employer/candidates" routerLinkActive="active" class="nav-item">
          <i class="bi bi-people"></i>
          <span>Ứng viên</span>
          <span class="badge rounded-pill bg-danger ms-auto">Mới</span>
        </a>
        <a routerLink="/employer/company" routerLinkActive="active" class="nav-item">
          <i class="bi bi-building-gear"></i>
          <span>Hồ sơ công ty</span>
        </a>
      </nav>

      <div class="sidebar-footer mt-auto pt-4 border-top">
        <a routerLink="/jobs" class="nav-item back-home">
          <i class="bi bi-house"></i>
          <span>Về trang chủ</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .employer-sidebar {
      width: 280px;
      height: 100vh;
      background: white;
      border-right: 1px solid #eef2f6;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
    }

    .employer-avatar {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 12px;
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s;

      i { font-size: 1.2rem; }

      &:hover {
        background: #f8fafc;
        color: #2563eb;
      }

      &.active {
        background: #2563eb;
        color: white;
        box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);

        .badge { background: white !important; color: #ef4444 !important; }
      }
    }

    .back-home {
      color: #94a3b8;
      &:hover { color: #2563eb; background: #f8fafc; }
    }
  `]
})
export class EmployerSidebarComponent {}
