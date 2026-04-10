import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; 
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss' 
})
export class RegisterComponent {
  // Tiêm (Inject) các dịch vụ cần thiết
  private authService = inject(AuthService);
  private router = inject(Router);

  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp Nhân ơi!');
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: (res: any) => {
        alert('Đăng ký thành công! Giờ sếp có thể đăng nhập được rồi.');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error(err);
        alert('Đăng ký thất bại: ' + (err.error?.message || 'Email đã tồn tại hoặc lỗi hệ thống'));
      }
    });
  }
}