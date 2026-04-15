import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Toàn bộ app dùng localStorage (JWT) → không tương thích SSR → dùng Client rendering
    path: '**',
    renderMode: RenderMode.Client
  }
];
