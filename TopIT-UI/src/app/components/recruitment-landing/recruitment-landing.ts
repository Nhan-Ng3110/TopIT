import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recruitment-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruitment-landing.html',
  styleUrl: './recruitment-landing.scss'
})
export class RecruitmentLandingComponent {
  private router = inject(Router);
  private notification = inject(NotificationService);
  private http = inject(HttpClient);

  formData = {
    companyName: '',
    name: '',
    jobPosition: '',
    email: '',
    phone: '',
    source: '',
    note: '',
    acceptPersonalData: false,
    acceptNotifications: false
  };

  isSubmitting = false;

  onSubmit() {
    if (!this.formData.acceptPersonalData) {
      this.notification.error('Vui lòng đồng ý với điều khoản bảo mật dữ liệu.');
      return;
    }

    this.isSubmitting = true;
    
    // Gọi API để tạo Yêu cầu tư vấn
    this.http.post('https://localhost:7151/api/ConsultationRequests', this.formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.notification.success('Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ trong thời gian sớm nhất.');
        this.router.navigate(['/thank-you']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
        console.error(err);
      }
    });
  }
}
