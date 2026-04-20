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
    
    // Giả lập việc gửi yêu cầu và chuyển đổi role thành Employer cho demo
    // Trong thực tế sẽ gọi API và đợi tư vấn viên duyệt hoặc chuyển role
    setTimeout(() => {
      this.notification.success('Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ sớm nhất.');
      
      // Demo logic: Tự động chuyển role Employer cho user hiện tại (giả định đã login)
      // Nếu chưa login thì redirect qua login với param là employer
      this.router.navigate(['/jobs']); 
    }, 1500);
  }
}
