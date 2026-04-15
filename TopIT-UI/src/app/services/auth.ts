import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7151/api/auth'; 
  
  // Quản lý trạng thái người dùng (Tên người dùng từ Token)
  private currentUserSubject = new BehaviorSubject<string | null>(this.getUserNameFromToken());
  currentUser$ = this.currentUserSubject.asObservable();

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('topit_token', res.token);
          // Cập nhật BehaviorSubject ngay sau khi login thành công
          this.currentUserSubject.next(this.getUserNameFromToken());
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('topit_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('topit_token');
  }

  getUserNameFromToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('topit_token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      // Lấy giá trị unique_name hoặc name từ JWT claims
      return decoded.unique_name || decoded.name || decoded.sub || null;
    } catch (e) {
      console.error('Lỗi giải mã token:', e);
      return null;
    }
  }

  getUserIdFromToken(): number | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('topit_token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      // Lấy ID từ các claim phổ biến: nameid, sub hoặc id
      const id = decoded.nameid || decoded.sub || decoded.id;
      return id ? Number(id) : null;
    } catch {
      return null;
    }
  }
}