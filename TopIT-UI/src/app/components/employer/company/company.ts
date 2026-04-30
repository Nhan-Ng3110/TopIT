import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NotificationService } from '../../../services/notification';
import { FormsModule } from '@angular/forms';

const API_BASE_URL = 'https://localhost:7151';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="company-page animate-fade">
      <div class="mb-4">
        <h2 class="fw-bold mb-1">Hồ sơ công ty</h2>
        <p class="text-muted small">Quản lý nhận diện thương hiệu và thông tin doanh nghiệp</p>
      </div>

      <div class="row g-4">
        <!-- Cột trái: Form thông tin -->
        <div class="col-lg-8">
          <div class="card-premium p-4 mb-4">
            <h5 class="fw-bold mb-4 border-bottom pb-2">Thông tin cơ bản</h5>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label small fw-bold">Tên công ty</label>
                <input type="text" class="form-control" [(ngModel)]="company().name">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Website</label>
                <input type="text" class="form-control" [(ngModel)]="company().website">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Quy mô</label>
                <input type="text" class="form-control" [(ngModel)]="company().size" placeholder="Ví dụ: 500-1000 nhân viên">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Địa chỉ</label>
                <input type="text" class="form-control" [(ngModel)]="company().address">
              </div>
              <div class="col-12">
                <label class="form-label small fw-bold">Giới thiệu công ty</label>
                <textarea class="form-control" rows="5" [(ngModel)]="company().description"></textarea>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button class="btn btn-primary rounded-pill px-5 hover-glow" [disabled]="isSaving()" (click)="saveInfo()">
                {{ isSaving() ? 'Đang lưu...' : 'Lưu thay đổi' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Cột phải: Branding (Logo & Cover) -->
        <div class="col-lg-4">
          <div class="card-premium p-4 mb-4">
            <h5 class="fw-bold mb-4 border-bottom pb-2">Employer Branding</h5>
            
            <div class="branding-section mb-4">
               <label class="form-label small fw-bold mb-3">Cover Photo (Ảnh bìa)</label>
               <div class="cover-preview-box mb-3" [style.background-image]="'url(' + (company().coverUrl || 'assets/default-cover.jpg') + ')'">
                  <div class="overlay d-flex align-items-center justify-content-center">
                    <label for="coverUpload" class="btn btn-light btn-sm rounded-pill shadow-sm">
                       <i class="bi bi-camera me-1"></i> Thay đổi
                    </label>
                    <input type="file" id="coverUpload" class="d-none" (change)="onFileSelected($event, 'cover')">
                  </div>
               </div>
               <p class="smallest text-muted">Kích thước gợi ý: 1200x300px. Dạng JPG, PNG.</p>
            </div>

            <div class="branding-section">
               <label class="form-label small fw-bold mb-3">Company Logo</label>
               <div class="d-flex align-items-center gap-4">
                  <div class="logo-preview-box">
                     <img [src]="company().logoUrl || 'assets/default-company.png'" alt="Logo">
                  </div>
                  <div>
                    <label for="logoUpload" class="btn btn-outline-secondary btn-sm rounded-pill">Tải lên Logo</label>
                    <input type="file" id="logoUpload" class="d-none" (change)="onFileSelected($event, 'logo')">
                  </div>
               </div>
            </div>
          </div>

          <div class="card-premium p-4 bg-light shadow-none">
             <h6 class="fw-bold mb-2">Mẹo thương hiệu</h6>
             <p class="smallest text-muted mb-0">Một tấm ảnh bìa đẹp và mô tả công ty chi tiết sẽ giúp tăng 40% tỉ lệ ứng viên nộp hồ sơ.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cover-preview-box {
      width: 100%; height: 160px; border-radius: 12px; background-size: cover; background-position: center; position: relative; overflow: hidden; border: 1px solid #eef2f6;
      .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); opacity: 0; transition: 0.3s; }
      &:hover .overlay { opacity: 1; }
    }
    .logo-preview-box {
      width: 80px; height: 80px; border-radius: 12px; border: 1px solid #eef2f6; background: white; display: flex; align-items: center; justify-content: center; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
    }
  `]
})
export class CompanyProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  company = signal<any>({
    name: '',
    website: '',
    size: '',
    address: '',
    description: '',
    logoUrl: null,
    coverUrl: null
  });

  isSaving = signal(false);

  ngOnInit() {
    this.loadCompany();
  }

  loadCompany() {
    const token = localStorage.getItem('topit_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`${API_BASE_URL}/api/companies/profile`, { headers }).subscribe({
      next: (res: any) => this.company.set(res),
      error: () => this.notification.error('Không thể tải thông tin công ty')
    });
  }

  saveInfo() {
    this.isSaving.set(true);
    const token = localStorage.getItem('topit_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.put(`${API_BASE_URL}/api/companies/profile`, this.company(), { headers }).subscribe({
      next: () => {
        this.notification.success('Đã cập nhật thông tin công ty');
        this.isSaving.set(false);
      },
      error: () => {
        this.notification.error('Lỗi khi lưu thông tin');
        this.isSaving.set(false);
      }
    });
  }

  onFileSelected(event: any, type: string) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'cover' ? '/api/companies/upload-cover' : '/api/companies/upload-logo';
      const token = localStorage.getItem('topit_token');
      
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(`${API_BASE_URL}${endpoint}`, formData, { headers }).subscribe({
        next: (res: any) => {
          this.notification.success('Tải ảnh lên thành công');
          if (type === 'cover') {
            this.company.update(c => ({ ...c, coverUrl: res.coverUrl }));
          } else if (type === 'logo') {
            this.company.update(c => ({ ...c, logoUrl: res.logoUrl }));
          }
        },
        error: () => this.notification.error('Lỗi khi tải ảnh lên')
      });
    }
  }
}
