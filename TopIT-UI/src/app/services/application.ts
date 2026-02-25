import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'https://localhost:7151/api/Applications'; 

  constructor(private http: HttpClient) { }

  // 1. Hàm nộp CV (Upload File)
  applyJob(jobId: number, userId: number, message: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('jobId', jobId.toString());
    formData.append('userId', userId.toString());
    formData.append('message', message);
    formData.append('cvFile', file); 

    return this.http.post(`${this.apiUrl}/apply`, formData);
  }

  // 2. Lấy danh sách ứng viên cho Nhà tuyển dụng
  getApplicationsByJob(jobId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/job/${jobId}`);
  }
}