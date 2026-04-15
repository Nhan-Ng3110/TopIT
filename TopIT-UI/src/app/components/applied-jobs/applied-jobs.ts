import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationService } from '../../services/application';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-applied-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './applied-jobs.html',
  styleUrls: ['./applied-jobs.scss']
})
export class AppliedJobsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  applications: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      this.loading = false;
      return;
    }

    this.applicationService.getApplicationsByUser(userId).subscribe({
      next: (res: any) => {
        this.applications = res;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Không thể tải danh sách việc làm đã ứng tuyển');
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'interview': return 'status-interview';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Đang chờ duyệt';
      case 'interview': return 'Hẹn phỏng vấn';
      case 'accepted': return 'Được chấp nhận';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  }
}
