import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JobListComponent } from './components/job-list/job-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JobListComponent], 
  templateUrl: './app.html', 
  styleUrl: './app.scss'
})
export class App {} 