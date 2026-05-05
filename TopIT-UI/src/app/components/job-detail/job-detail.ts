import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job';
import { AuthService } from '../../services/auth';
import { UserCvService } from '../../services/user-cv.service';
import { ApplicationService } from '../../services/application';
import { NotificationService } from '../../services/notification';
import { ChatWidgetComponent } from '../chat/chat-widget';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChatWidgetComponent],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.scss']
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private userCvService = inject(UserCvService);
  private applicationService = inject(ApplicationService);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  job: any = null;
  showApplyModal = false;
  userCvs: any[] = [];
  selectedCvId: number | null = null;
  selectedCvPath: string = '';
  applyMessage: string = '';

  applyForm = {
    fullName: '',
    phone: '',
    email: ''
  };
  wordCount: number = 0;
  existingApplication: any = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadJobDetail(id);
      }
    });
  }

  loadJobDetail(id: number) {
    this.jobService.getJobById(id).subscribe({
      next: (res: any) => {
        this.job = res;
        if (this.job) {
          this.job.id = this.job.id || this.job.Id;
          this.job.isApplied = this.job.isApplied ?? this.job.IsApplied ?? false;
          this.existingApplication = this.job.existingApplication || this.job.ExistingApplication || null;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error('Không thể tải thông tin công việc');
        this.router.navigate(['/jobs']);
      }
    });
  }

  onApplyNow() {
    if (!this.authService.isAuthenticated()) {
      const returnUrl = this.router.url;
      this.notification.info('Vui lòng đăng nhập để ứng tuyển');
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }
    const userName = this.authService.getUserNameFromToken();
    if (userName) this.applyForm.fullName = userName;
    this.loadUserCvs();
  }

  loadUserCvs() {
    this.userCvService.getCVs().subscribe({
      next: (res: any) => {
        this.userCvs = res;
        if (this.job.isApplied && this.existingApplication) {
          const oldCvPath = this.existingApplication.cvPath || this.existingApplication.CVPath;
          const oldMessage = this.existingApplication.message || this.existingApplication.Message || '';
          const matchedCv = this.userCvs.find(cv => {
            const urlParts = cv.fileUrl?.split('/') ?? [];
            const fileName = urlParts[urlParts.length - 1];
            return fileName === oldCvPath;
          });
          if (matchedCv) this.selectCv(matchedCv);
          this.applyMessage = oldMessage;
          this.updateWordCount();
        }
        this.showApplyModal = true;
      },
      error: () => {
        this.notification.error('Không thể lấy danh sách CV');
      }
    });
  }

  selectCv(cv: any) {
    this.selectedCvId = cv.id;
    const urlParts = cv.fileUrl.split('/');
    this.selectedCvPath = urlParts[urlParts.length - 1];
  }

  updateWordCount() {
    this.wordCount = this.applyMessage.trim() ? this.applyMessage.trim().split(/\s+/).length : 0;
  }

  closeModal() {
    this.showApplyModal = false;
    this.selectedCvId = null;
    this.applyMessage = '';
    this.wordCount = 0;
  }

  submitApplication() {
    if (!this.selectedCvId || !this.job) return;
    const userId = this.authService.getUserIdFromToken();
    if (!userId) return;

    const isUpdate = this.job.isApplied;
    const jobId = this.job.id || this.job.Id;
    const applicationData = {
      jobId,
      userId,
      cvPath: this.selectedCvPath,
      message: this.applyMessage
    };

    this.applicationService.applyWithExistingCV(applicationData).subscribe({
      next: () => {
        this.notification.success(isUpdate
          ? 'Cập nhật hồ sơ ứng tuyển thành công!'
          : 'Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.');
        this.job.isApplied = true;
        this.existingApplication = { CVPath: this.selectedCvPath, Message: this.applyMessage };
        this.closeModal();
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Có lỗi xảy ra khi nộp đơn';
        this.notification.error(msg);
      }
    });
  }

  openChat() {
    if (!this.authService.isAuthenticated()) {
      const returnUrl = this.router.url;
      this.notification.info('Vui lòng đăng nhập để chat với nhà tuyển dụng!');
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
      return;
    }
    this.notification.info('Tính năng Chat với Employer đang được cập nhật...');
  }

  /** Tách text thành đoạn văn */
  formatLines(text: string): string[] {
    if (!text) return [];
    return text.split('\n').filter(l => l.trim().length > 0);
  }

  /** Tách text thành bullet */
  formatBullets(text: string): string[] {
    if (!text) return [];
    const lines = text
      .split('\n')
      .map(l => l.replace(/^[-•*]+\s*/, '').trim())
      .filter(l => l.length > 0);
    if (lines.length === 1) {
      return lines[0].split(/[.;]/).map(s => s.trim()).filter(s => s.length > 3);
    }
    return lines;
  }
}
