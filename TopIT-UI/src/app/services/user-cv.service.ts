import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserCV {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserCvService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7151/api/UserCV';

  getCVs(): Observable<UserCV[]> {
    return this.http.get<UserCV[]>(this.apiUrl);
  }

  uploadCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  deleteCV(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  setDefault(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/set-default`, {});
  }
}
