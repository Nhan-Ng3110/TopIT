import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * adminGuard - Functional CanActivate Guard (Angular 14+)
 *
 * Bảo vệ tất cả route /admin/**
 * Logic:
 *  1. Nếu chưa đăng nhập (không có token)  → redirect /login
 *  2. Nếu đã đăng nhập nhưng Role != Admin → redirect /forbidden
 *  3. Nếu Role = Admin                      → cho phép truy cập
 *
 * Role được giải mã trực tiếp từ JWT Token bằng AuthService.getUserRoleFromToken()
 * (không cần lưu riêng vào localStorage)
 */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // SSR guard: không chạy trên server
  if (typeof window === 'undefined') return false;

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getUserRoleFromToken();

  if (role === 'Admin') {
    return true;
  }

  // Đã đăng nhập nhưng không đủ quyền → 403 Forbidden page
  router.navigate(['/forbidden']);
  return false;
};
