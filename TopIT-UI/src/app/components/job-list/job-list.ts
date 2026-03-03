import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../../services/job'; 
import { ApplicationService } from '../../services/application'; // 1. Nhớ import service nộp đơn

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobListComponent implements OnInit {
  private jobService = inject(Job);
  private appService = inject(ApplicationService); 

  // --- BIẾN ĐIỀU KHIỂN ĐÓNG/MỞ UI ---
  isOffcanvasOpen = false;
  isLevelDropdownOpen = false;
  isModelDropdownOpen = false;

  // --- BIẾN LƯU TRỮ DỮ LIỆU LỌC ---
  selectedLevels: string[] = [];
  selectedModels: string[] = [];
  
  jobs = signal<any[]>([]);
  title = signal('Nguyễn Thành Nhân - TopIT');
  selectedFile: File | null = null; 
  selectedJob = signal<any>(null);

  searchFilter = {
    keyWord: '',
    location: '',
    salaryMin: null
  };

  ngOnInit() {
    this.onSearch();
  }

  // 4. Cần thêm hàm này để bắt sự kiện chọn file từ HTML
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('File đã chọn:', this.selectedFile);
  }

  apply(jobId: number) {
    const userId = 1; 
    const message = "Em nộp đơn từ component mới!";

    if (!this.selectedFile) {
      alert("Nhân ơi, chọn CV trước khi nộp nhé!");
      return;
    }

    this.appService.applyJob(jobId, userId, message, this.selectedFile).subscribe({
      next: (res: any) => alert("Nộp thành công! " + res.message),
      error: (err: any) => alert("Lỗi nộp đơn: " + (err.error?.message || err.message))
    });
  }

    onSelectJob(job: any) {
    this.selectedJob.set(job);
  }

  onSearch() {
    this.jobService.getJobs(this.searchFilter).subscribe({
      next: (data: any) => {
        this.jobs.set(data);
        console.log('Dữ liệu đã về:', data);
      },
      error: (err) => console.error('Lỗi kết nối API:', err)
    });
  }

  toggleFilterMenu() {
  this.isOffcanvasOpen = !this.isOffcanvasOpen;
}

// Hàm mở các Dropdown Checkbox
toggleDropdown(type: string) {
  if (type === 'level') {
    this.isLevelDropdownOpen = !this.isLevelDropdownOpen;
    this.isModelDropdownOpen = false; // Đóng cái kia lại
  } else {
    this.isModelDropdownOpen = !this.isModelDropdownOpen;
    this.isLevelDropdownOpen = false;
  }
}

// Hàm xử lý khi người dùng tích vào Checkbox
onCheckboxChange(filterType: string, value: string, event: any) {
  const isChecked = event.target.checked;
  let targetArray = filterType === 'level' ? this.selectedLevels : this.selectedModels;

  if (isChecked) {
    targetArray.push(value);
  } else {
    const index = targetArray.indexOf(value);
    if (index > -1) targetArray.splice(index, 1);
  }

  


  console.log('Đang lọc Level:', this.selectedLevels, 'Model:', this.selectedModels);

  }

  applyFilters() {
    console.log('--- Applying Filters ---');
    console.log('Selected Levels:', this.selectedLevels);
    console.log('Selected Models:', this.selectedModels);
    
    // Close the sidebar after applying
    this.isOffcanvasOpen = false;

  
  }


  resetFilters() {
    console.log('--- Resetting Filters ---');
    this.selectedLevels = [];
    this.selectedModels = [];
    
  }

  // --- BIẾN CHO SIDEBAR FILTER ---
  sidebarLevels: string[] = [];
  sidebarModels: string[] = [];
  selectedSalary: number = 0; 


  togglePill(type: string, value: string) {
      let targetArray = type === 'level' ? this.sidebarLevels : this.sidebarModels;
      const index = targetArray.indexOf(value);
      
      if (index > -1) {
        targetArray.splice(index, 1);
      } else {
        targetArray.push(value);
      }
      
      // GỌI HÀM LỌC NGAY KHI CLICK
      this.applyFilters(); 
    }

  
  isPillSelected(type: string, value: string): boolean {
    let targetArray = type === 'level' ? this.sidebarLevels : this.sidebarModels;
    return targetArray.includes(value);
  }

  
}