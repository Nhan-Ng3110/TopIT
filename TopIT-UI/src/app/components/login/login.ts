import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../../services/auth'; 
import { NotificationService } from '../../services/notification';

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
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  loginData = {
    email: '', 
    password: ''
  };

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.token) {
          this.notificationService.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
          
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/jobs';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        console.error(err);
        if (err.status === 0) {
          this.notificationService.error('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại backend nhé!');
        } else {
          this.notificationService.error('Đăng nhập thất bại: ' + (err.error?.message || 'Email hoặc mật khẩu không đúng'));
        }
      }
    });
  }
}
