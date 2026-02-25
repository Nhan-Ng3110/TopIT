import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Job } from './services/job';
import { ApplicationService } from './services/application';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App implements OnInit { 
  protected readonly title = signal('Nguyễn Thành Nhân - TopIT');
  jobs = signal<any[]>([]);
  selectedFile: File | null = null;
  
  constructor(protected readonly jobService: Job,private readonly appService: ApplicationService) {
    console.log("1. App constructor");
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('File đã chọn:', this.selectedFile);
  }

  // Hàm bấm nút Nộp đơn
  apply(jobId: number) {
    const userId = 1; // Tạm thời hardcode ID của Nhân để test
    const message = "Em nộp đơn thử nghiệm ạ!";

    if (!this.selectedFile) {
      alert("Nhân ơi, bạn chưa chọn file CV mà!");
      return;
    }

    this.appService.applyJob(jobId, userId, message, this.selectedFile).subscribe({
      next: (res) => {
        alert("Ngon rồi! " + res.message);
        console.log("Link CV nè:", res.cvUrl);
      },
      error: (err) => alert("Lỗi rồi: " + err.error)
    });
  }
  
  ngOnInit() {
    this.jobService.getJobs().subscribe({
      next: (data: any) => {
        this.jobs.set(data);
        console.log('Dữ liệu công việc đã về tới đây:', data);
      },
      error: (err) => console.error('Error', err)
    });
  }
}
