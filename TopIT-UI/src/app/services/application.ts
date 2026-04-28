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

  // 3. Nộp CV từ danh sách CV hiện có
  applyWithExistingCV(data: { jobId: number, userId: number, cvPath: string, message?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply-existing-cv`, data);
  }

  // 4. Lấy danh sách việc làm đã ứng tuyển của User
  getApplicationsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // 5. Lấy danh sách việc làm đã ứng tuyển của User hiện tại (từ Token)
  getMyApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-applications`);
  }

  // 6. Lấy danh sách ứng viên (Dành cho Employer)
  getEmployerApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employer-all`);
  }

  // 7. Cập nhật trạng thái ứng viên
  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }
}