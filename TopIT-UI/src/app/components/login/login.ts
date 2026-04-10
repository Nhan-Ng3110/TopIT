import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; //
import { RouterLink, Router } from '@angular/router'; // Thêm Router để chuyển trang
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: '../login/login.html',
  styleUrl: '../login/login.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = {
    username: 'admin', 
    password: 'password'
  };

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.token) {
          localStorage.setItem('topit_token', res.token); // Lưu vào bộ nhớ trình duyệt
          alert('Đăng nhập thành công! Chào mừng sếp Nhân quay trở lại.');
          
          // Chuyển hướng về trang danh sách việc làm
          this.router.navigate(['/jobs']);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Đăng nhập thất bại: ' + (err.error?.message || 'Có lỗi xảy ra'));
      }
  });
}
}
