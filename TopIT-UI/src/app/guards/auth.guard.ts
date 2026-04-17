import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * Kiểm tra token hết hạn bằng cách decode payload JWT (không cần thư viện).
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // `exp` là Unix timestamp (giây) — so sánh với thời điểm hiện tại
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // token lỗi format → coi là hết hạn
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    const token = localStorage.getItem('topit_token');
    if (token && !isTokenExpired(token)) {
      return true; // Token hợp lệ và chưa hết hạn
    }
    // Token hết hạn → xóa đi để buộc login lại
    if (token) {
      localStorage.removeItem('topit_token');
    }
  }

  router.navigate(['/login']);
  return false;
};
