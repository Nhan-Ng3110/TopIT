import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-premium" [class]="toast.type" (click)="notificationService.remove(toast.id)">
          <div class="toast-content">
            <div class="toast-icon">
              @if (toast.type === 'success') { <i class="bi bi-check-circle-fill"></i> }
              @if (toast.type === 'error') { <i class="bi bi-exclamation-triangle-fill"></i> }
              @if (toast.type === 'info') { <i class="bi bi-info-circle-fill"></i> }
              @if (toast.type === 'warning') { <i class="bi bi-exclamation-circle-fill"></i> }
            </div>
            <div class="toast-text">
              <div class="toast-title">{{ toast.title }}</div>
              <div class="toast-message">{{ toast.message }}</div>
            </div>
          </div>
          <button class="btn-close-toast"><i class="bi bi-x"></i></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 40px;
      right: 40px;
      z-index: 200000;
      display: flex;
      flex-direction: column;
      gap: 15px;
      pointer-events: none;
    }

    .toast-premium {
      pointer-events: auto;
      min-width: 320px;
      max-width: 450px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      padding: 18px 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      cursor: pointer;
      overflow: hidden;
      
      /* Animation Premium: Slide & Scale */
      animation: toast-bay-len 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18);
      }

      &.success { 
        border-left: 6px solid #10b981; 
        .toast-icon i { color: #10b981; }
      }
      &.error { 
        border-left: 6px solid #ef4444; 
        .toast-icon i { color: #ef4444; }
      }
      &.info { 
        border-left: 6px solid #3b82f6; 
        .toast-icon i { color: #3b82f6; }
      }
      &.warning { 
        border-left: 6px solid #f59e0b; 
        .toast-icon i { color: #f59e0b; }
      }
    }

    @keyframes toast-bay-len {
      from { 
        opacity: 0; 
        transform: translateY(60px) scale(0.7); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .toast-icon {
      font-size: 1.8rem;
      display: flex;
      align-items: center;
    }

    .toast-title {
      font-weight: 800;
      font-size: 1.05rem;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.5;
      font-weight: 500;
    }

    .btn-close-toast {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      padding: 0;
      cursor: pointer;
      transition: color 0.2s;
      &:hover { color: #0f172a; }
    }
  `]
})
export class NotificationToastComponent {
  notificationService = inject(NotificationService);
}
