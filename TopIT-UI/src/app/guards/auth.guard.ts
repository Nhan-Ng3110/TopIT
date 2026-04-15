import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * Functional Auth Guard to protect routes.
 * It checks for a 'token' in localStorage.
 * If found, allows navigation. Otherwise, redirects to /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // For Angular SSR safety, check if window is defined
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    const token = localStorage.getItem('topit_token');
    if (token) {
      return true;
    }
  }

  // Redirect to login if no token or not in browser (for SSR initial load)
  router.navigate(['/login']);
  return false;
};
