import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  // Hãy đảm bảo port 7151 đúng với port Backend của bạn đang chạy
  private apiUrl = 'https://localhost:7151/api/Jobs'; 

  getJobs(filter: any): Observable<any[]> {
    let params = new HttpParams();
    
    // Tự động chuyển object filter thành Query String (vd: ?keyWord=dotnet)
    Object.keys(filter).forEach(key => {
      if (filter[key] !== null && filter[key] !== '') {
        params = params.set(key, filter[key]);
      }
    });

    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }

  getJobById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // --- Saved Jobs ---
  toggleSaveJob(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/toggle-save/${id}`, {});
  }

  getSavedJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/saved-jobs`);
  }

  // --- Viewed Jobs ---
  getViewedJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/viewed-jobs`);
  }

  // --- Employer Jobs ---
  getEmployerJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-jobs`);
  }

  createJob(jobData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, jobData);
  }

  toggleJobStatus(jobId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${jobId}/toggle-status`, {});
  }
}