import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {
  private router = inject(Router);

  // Mock data - In a real app, this would come from an AuthService or API
  userProfile = {
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'Software Engineer'
  };

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
