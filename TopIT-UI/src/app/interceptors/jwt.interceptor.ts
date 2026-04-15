import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Functional HTTP Interceptor to add JWT token to Authorization header.
 * It retrieves the 'token' from localStorage if running in the browser.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if we are in the browser to safely access localStorage
  const isBrowser = typeof window !== 'undefined';
  let token: string | null = null;

  if (isBrowser) {
    token = localStorage.getItem('topit_token');
  }

  // If token exists, clone the request and add the Authorization header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  // Otherwise, pass the original request
  return next(req);
};
