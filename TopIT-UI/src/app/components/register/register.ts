import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; 
import { AuthService } from '../../services/auth'; 
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss' 
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.notificationService.warning('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (res: any) => {
        this.notificationService.success('Đăng ký thành công! Giờ bạn có thể đăng nhập được rồi.');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error(err);
        if (err.status === 0) {
          this.notificationService.error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra xem backend đã chạy chưa nhé!');
        } else {
          this.notificationService.error('Đăng ký thất bại: ' + (err.error?.message || 'Email đã tồn tại hoặc lỗi hệ thống'));
        }
      }
    });
  }
}