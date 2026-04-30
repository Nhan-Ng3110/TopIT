import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UserCvService, UserCV, ParsedCvData } from '../../services/user-cv.service';
import { ApplicationService } from '../../services/application';
import { JobService } from '../../services/job';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface TopItCVData {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  linkedIn: string;
  github: string;
  summary: string;
  technicalSkills: string;
  softSkills: string;
  experiences: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  educations: {
    school: string;
    major: string;
    duration: string;
    description: string;
  }[];
  projects: {
    name: string;
    duration: string;
    description: string;
  }[];
  languages: string;
  hobbies: string;
  certificates: string;
  references: string;
  activities: string;
  otherInformation: string;
}
@Component({
  selector: 'app-cv-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cv-management.html',
  styleUrl: './cv-management.scss'
})
export class CvManagementComponent implements OnInit {
  private cvService = inject(UserCvService);
  private applicationService = inject(ApplicationService);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // Management State
  activeSubTab = signal<string>('cvs');
  loading = signal<boolean>(false);

  // TopIT CV Builder State
  isImportModalOpen = false;
  isConverting = false;
  cvBuilderData: TopItCVData = {
    fullName: '',
    address: '',
    phone: '',
    email: '',
    linkedIn: '',
    github: '',
    summary: '',
    technicalSkills: '',
    softSkills: '',
    experiences: [],
    educations: [],
    projects: [],
    languages: '',
    hobbies: '',
    certificates: '',
    references: '',
    activities: '',
    otherInformation: ''
  };

  // Data Signals
  cvs = signal<UserCV[]>([]);
  appliedJobs = signal<any[]>([]);
  savedJobs = signal<any[]>([]);
  viewedJobs = signal<any[]>([]);

  isPreviewModalOpen = false;
  safeCvUrl: SafeResourceUrl | null = null;
  selectedCvId: number | null = null;

  // Mock data for TopDev layout completeness
  completeness = 10;
  userName = 'Thành Nhân Nguyễn';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['builder', 'cvs', 'applied', 'saved', 'viewed'].includes(tab)) {
        this.activeSubTab.set(tab);
      }
      this.loadData();
    });
  }

  loadData() {
    const tab = this.activeSubTab();
    if (tab === 'builder') return; // Tab CV builder không cần load dữ liệu
    if (tab === 'cvs') this.loadCVs();
    else this.loadJobsData(tab);
  }

  setSubTab(tab: string) {
    this.activeSubTab.set(tab);
    this.loadData();
  }

  loadCVs() {
    this.loading.set(true);
    this.cvService.getCVs().subscribe({
      next: (data) => {
        this.cvs.set(data);
        const defaultCv = data.find(c => c.isDefault);
        if (defaultCv) this.selectedCvId = defaultCv.id;
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Không thể tải danh sách CV.');
        this.loading.set(false);
      }
    });
  }

  loadJobsData(tab: string) {
    this.loading.set(true);
    if (tab === 'applied') {
      this.applicationService.getMyApplications().subscribe({
        next: (res) => { this.appliedJobs.set(res); this.loading.set(false); },
        error: () => this.handleJobsError()
      });
    } else if (tab === 'saved') {
      this.jobService.getSavedJobs().subscribe({
        next: (res) => { this.savedJobs.set(res); this.loading.set(false); },
        error: () => this.handleJobsError()
      });
    } else if (tab === 'viewed') {
      this.jobService.getViewedJobs().subscribe({
        next: (res) => { this.viewedJobs.set(res); this.loading.set(false); },
        error: () => this.handleJobsError()
      });
    }
  }

  handleJobsError() {
    this.notificationService.error('Không thể tải dữ liệu việc làm. Vui lòng thử lại.');
    this.loading.set(false);
  }

  toggleSave(jobId: number) {
    this.jobService.toggleSaveJob(jobId).subscribe({
      next: (res) => {
        this.notificationService.success(res.message);
        this.loadData();
      }
    });
  }

  // Helpers copied from Dashboard
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cvService.uploadCV(file).subscribe({
        next: (res) => {
          this.notificationService.success(res.message);
          this.loadCVs();
        },
        error: (err) => this.notificationService.error(err.error?.message || 'Lỗi khi tải lên CV.')
      });
    }
  }

  deleteCV(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa bản CV này?')) {
      this.cvService.deleteCV(id).subscribe({
        next: (res) => {
          this.notificationService.success(res.message);
          this.loadCVs();
        },
        error: () => this.notificationService.error('Lỗi khi xóa CV.')
      });
    }
  }

  setDefault(id: number) {
    this.cvService.setDefault(id).subscribe({
      next: (res) => {
        this.notificationService.success(res.message);
        this.loadCVs();
      },
      error: () => this.notificationService.error('Thiết lập thất bại.')
    });
  }

  previewCV(url: string, event: Event) {
    event.stopPropagation();
    this.safeCvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.isPreviewModalOpen = true;
  }

  closePreview() {
    this.isPreviewModalOpen = false;
    this.safeCvUrl = null;
  }

  // --- IMPORT CV LOGIC ---
  openImportModal() {
    this.isImportModalOpen = true;
    // Load CVs if not already loaded so user can select existing ones
    if (this.cvs().length === 0) {
      this.loadCVs();
    }
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  onImportFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.callParseApi(file);
  }

  convertCv(cvId: number) {
    // Tìm CV trong danh sách
    const cv = this.cvs().find(c => c.id === cvId);
    if (!cv) return;

    // Tải file từ URL về dưới dạng Blob rồi convert sang File
    this.isConverting = true;
    this.closeImportModal();
    fetch(cv.fileUrl)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], cv.fileName, { type: 'application/pdf' });
        this.callParseApi(file);
      })
      .catch(() => {
        this.isConverting = false;
        this.cdr.detectChanges();
        this.notificationService.error('Không thể tải file CV. Vui lòng thử tải lên file PDF từ máy tính.');
      });
  }

  private callParseApi(file: File) {
    this.isConverting = true;
    this.isImportModalOpen = false;
    this.cdr.detectChanges();

    this.cvService.parseCV(file).subscribe({
      next: (result: ParsedCvData) => {
        this.cvBuilderData.fullName = result.fullName || '';
        this.cvBuilderData.email = result.email || '';
        this.cvBuilderData.phone = result.phone || '';
        this.cvBuilderData.summary = result.summary || '';
        this.cvBuilderData.technicalSkills = result.technicalSkills || '';
        this.cvBuilderData.softSkills = result.softSkills || '';
        this.cvBuilderData.experiences = result.experiences || [];
        this.cvBuilderData.educations = result.educations || [];
        this.cvBuilderData.projects = result.projects || [];
        this.isConverting = false;
        this.cdr.detectChanges();
        this.notificationService.success('AI đã phân tích xong! Vui lòng kiểm tra và bổ sung thêm thông tin còn thiếu.');
        // Chuyển sang tab builder
        this.activeSubTab.set('builder');
      },
      error: (err) => {
        this.isConverting = false;
        this.cdr.detectChanges();
        const msg = err.error?.message || 'Đã xảy ra lỗi khi phân tích CV. Vui lòng thử lại.';
        this.notificationService.error(msg);
      }
    });
  }
}
