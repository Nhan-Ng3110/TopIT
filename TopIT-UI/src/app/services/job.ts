import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Job {
  private apiUrl = 'https://localhost:7151/api/Jobs';

  constructor(private http: HttpClient) {}
    
  getJobs() {
    return this.http.get<any[]>(this.apiUrl);
  }
  
}
