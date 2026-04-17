import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../../services/application';
import { JobService } from '../../services/job';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss']
})
export class UserDashboardComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);


  // Tab management using Signals
  activeTab = signal<'applied' | 'saved' | 'viewed'>('applied');
  
  appliedJobs = signal<any[]>([]);
  savedJobs = signal<any[]>([]);
  viewedJobs = signal<any[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    // Chỉ gọi API khi chạy ở browser (tránh SSR gửi request không có token)
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'applied' || tab === 'saved' || tab === 'viewed') {
        this.activeTab.set(tab);
      }
      this.loadData();
    });
  }

  setTab(tab: 'applied' | 'saved' | 'viewed') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    const tab = this.activeTab();

    if (tab === 'applied') {
      this.applicationService.getMyApplications().subscribe({
        next: (res) => {
          this.appliedJobs.set(res);
          this.loading.set(false);
        },
        error: () => this.handleError()
      });
    } else if (tab === 'saved') {
      this.jobService.getSavedJobs().subscribe({
        next: (res) => {
          this.savedJobs.set(res);
          this.loading.set(false);
        },
        error: () => this.handleError()
      });
    } else if (tab === 'viewed') {
      this.jobService.getViewedJobs().subscribe({
        next: (res) => {
          this.viewedJobs.set(res);
          this.loading.set(false);
        },
        error: () => this.handleError()
      });
    }
  }

  handleError() {
    this.notification.error('Không thể tải dữ liệu. Vui lòng thử lại.');
    this.loading.set(false);
  }

  toggleSave(jobId: number) {
    this.jobService.toggleSaveJob(jobId).subscribe({
      next: (res) => {
        this.notification.success(res.message);
        this.loadData(); // Reload to update list
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      case 'accepted': case 'approved': return 'status-accepted';
      default: return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Đang chờ';
      case 'rejected': return 'Từ chối';
      case 'accepted': case 'approved': return 'Đã duyệt';
      default: return status;
    }
  }

  // Friendly TimeAgo logic
  getTimeAgo(date: any): string {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Vừa xong';
    if (diffInMins < 60) return `${diffInMins} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return past.toLocaleDateString('vi-VN');
  }
}
