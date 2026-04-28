import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './thank-you.html',
  styleUrl: './thank-you.scss',
})
export class ThankYouComponent {
}
