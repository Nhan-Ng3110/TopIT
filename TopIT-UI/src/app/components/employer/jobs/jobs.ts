import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification';
import { JobService } from '../../../services/job';
import { JobFormComponent } from '../job-form/job-form';
import { RouterModule } from '@angular/router';

const API_BASE_URL = 'https://localhost:7151';

interface EmployerJob {
  id: number;
  title: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  isNegotiable: boolean;
  level: string;
  jobType: string;
  createdAt: string;
  isActive: boolean;
  applicationCount: number;
}

@Component({
  selector: 'app-employer-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, JobFormComponent],
  template: `
    <div class="jobs-page animate-fade">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Tin tuyển dụng</h2>
          <p class="text-muted small">Quản lý các tin đăng tuyển và trạng thái tuyển dụng</p>
        </div>
        <button class="btn btn-primary rounded-pill px-4 hover-glow" *ngIf="!isCreatingJob()" (click)="isCreatingJob.set(true)">
          <i class="bi bi-plus-lg me-2"></i> Đăng tin mới
        </button>
      </div>

      <app-job-form *ngIf="isCreatingJob()" (formClosed)="isCreatingJob.set(false)" (jobCreated)="onJobCreated($event)"></app-job-form>

      <div class="row g-4" *ngIf="!isCreatingJob()">
        <div class="col-12" *ngFor="let job of jobs()">
          <div class="job-manage-card card-premium p-4 d-flex align-items-center justify-content-between hover-glow">
            <div class="job-main-info d-flex align-items-center gap-4">
              <div class="job-icon-box">
                <i class="bi bi-briefcase-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-1 text-main">{{ job.title }}</h5>
                <div class="d-flex gap-3 text-muted small">
                  <span><i class="bi bi-geo-alt me-1"></i> {{ job.location }}</span>
                  <span><i class="bi bi-calendar-event me-1"></i> {{ job.createdAt | date:'dd/MM/yyyy' }}</span>
                  <span><i class="bi bi-cash me-1"></i> {{ job.isNegotiable ? 'Thỏa thuận' : (job.salaryMin | number) + ' - ' + (job.salaryMax | number) }}</span>
                </div>
              </div>
            </div>

            <div class="job-stats-group d-flex gap-5 px-5 border-start border-end">
              <div class="stat-item text-center">
                 <div class="fw-bold fs-5 text-primary">--</div>
                 <div class="smallest text-muted text-uppercase fw-bold">Lượt xem</div>
              </div>
              <div class="stat-item text-center">
                 <div class="fw-bold fs-5 text-success">{{ job.applicationCount }}</div>
                 <div class="smallest text-muted text-uppercase fw-bold">Ứng tuyển</div>
              </div>
            </div>

            <div class="job-actions d-flex gap-3 align-items-center">
              <div class="form-check form-switch me-2">
                <input class="form-check-input toggle-status" type="checkbox" role="switch" 
                       [checked]="job.isActive" 
                       (change)="toggleStatus(job)" 
                       [title]="job.isActive ? 'Đang mở' : 'Đã đóng'">
              </div>
              <button class="btn btn-icon-only" title="Chỉnh sửa"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-icon-only text-danger" title="Xóa"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>

        <div *ngIf="jobs().length === 0" class="col-12 text-center py-5 card-premium">
           <i class="bi bi-file-earmark-plus display-1 text-muted opacity-25"></i>
           <p class="mt-3 text-muted">Bạn chưa đăng tin tuyển dụng nào</p>
           <button class="btn btn-primary rounded-pill mt-2" (click)="isCreatingJob.set(true)">Đăng tin ngay</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .job-icon-box {
      width: 56px; height: 56px; background: #f0f9ff; color: #0ea5e9; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
    }
    .job-manage-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #f1f5f9; }
    .btn-icon-only {
      width: 42px; height: 42px; border-radius: 12px; border: 1px solid #f1f5f9; background: white; color: #64748b; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      &:hover { background: #f8fafc; color: #2563eb; border-color: #2563eb; }
      &.text-danger:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
    }
    .toggle-status { width: 3em; height: 1.5em; cursor: pointer; }
    .toggle-status:checked { background-color: #10b981; border-color: #10b981; }
  `]
})
export class EmployerJobsComponent implements OnInit {
  private jobService = inject(JobService);
  private notification = inject(NotificationService);

  jobs = signal<EmployerJob[]>([]);
  isCreatingJob = signal<boolean>(false);

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobService.getEmployerJobs().subscribe({
      next: (res) => this.jobs.set(res),
      error: () => this.notification.error('Không thể tải danh sách tin tuyển dụng')
    });
  }

  onJobCreated(newJob: any) {
    this.isCreatingJob.set(false);
    this.loadJobs();
  }

  toggleStatus(job: EmployerJob) {
    this.jobService.toggleJobStatus(job.id).subscribe({
      next: (res) => {
        // Cập nhật state cục bộ bằng signal update thay vì fetch lại list
        this.jobs.update(jobs => 
          jobs.map(j => j.id === job.id ? { ...j, isActive: res.isActive } : j)
        );
        this.notification.success(res.message);
      },
      error: () => {
        // Rollback UI nếu lỗi
        job.isActive = !job.isActive;
        this.notification.error('Không thể cập nhật trạng thái');
      }
    });
  }
}
