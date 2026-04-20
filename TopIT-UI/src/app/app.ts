import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { NotificationToastComponent } from './components/notification-toast/notification-toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, NotificationToastComponent], 
  templateUrl: './app.html', 
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  
  userName: string | null = null;
  userRole: string | null = null;
  isLoggedIn = false;

  ngOnInit() {
    // Theo dõi trạng thái đăng nhập từ AuthService
    this.authService.currentUser$.subscribe(name => {
      this.userName = name;
      this.isLoggedIn = !!name;
      this.userRole = this.authService.getUserRoleFromToken();
    });
  }

  logout() {
    this.authService.logout();
  }
}