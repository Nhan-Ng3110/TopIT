import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification';

interface ConsultationRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  jobPosition: string;
  source: string;
  createdAt: string;
  status: string;
  note?: string;
}

const API = 'https://localhost:7151/api/ConsultationRequests';

@Component({
  selector: 'app-consultation-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-requests.html',
  styleUrl: './consultation-requests.scss'
})
export class ConsultationRequestsComponent implements OnInit {
  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  requests = signal<ConsultationRequest[]>([]);
  isLoading = signal(true);
  approvingId = signal<number | null>(null);

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading.set(true);
    this.http.get<ConsultationRequest[]>(API).subscribe({
      next: (data) => {
        this.requests.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Không thể tải danh sách yêu cầu tư vấn');
        this.isLoading.set(false);
      }
    });
  }

  approveRequest(req: ConsultationRequest) {
    this.approvingId.set(req.id);
    this.http.post(`${API}/${req.id}/approve`, {}).subscribe({
      next: () => {
        // Remove immediately from Signal list - no page reload needed
        this.requests.update(list => list.filter(r => r.id !== req.id));
        this.approvingId.set(null);
        this.notification.success(
          `Đã duyệt và gửi email đến ${req.email}`,
          'Phê duyệt thành công 🎉'
        );
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi duyệt yêu cầu');
        this.approvingId.set(null);
      }
    });
  }
}
