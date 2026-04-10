import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router'; // Thêm RouterLink vào đây

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './app.html', 
  styleUrl: './app.scss'
})
export class App {}