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
        // CẬP NHẬT QUAN TRỌNG: Lưu dữ liệu lấy từ API vào mảng gốc
        this.allJobs = data; 
        
        this.jobs.set(data);
        if (data && data.length > 0) {
          this.selectedJob.set(data[0]); // Tự động chọn Job đầu tiên khi load
        }
        console.log('Dữ liệu đã về:', data);
      },
      error: (err) => console.error('Lỗi kết nối API:', err)
    });
  }

    getDropdownText(type: string): string {
    const selectedList = type === 'level' ? this.sidebarLevels : this.sidebarModels;
    const defaultName = type === 'level' ? 'Cấp bậc' : 'Hình thức';

    if (selectedList.length === 0) {
      return defaultName; // Nếu chưa chọn gì thì hiện chữ mặc định
    }
    
    if (selectedList.length === 1) {
      return selectedList[0]; // Nếu chọn 1 cái thì hiện tên cái đó 
    }

    // Nếu chọn từ 2 cái trở lên: hiện cái đầu tiên kèm số lượng cộng thêm 
    return `${selectedList[0]} +${selectedList.length - 1}`;
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
    console.log('Đang tiến hành lọc dữ liệu...');

    // Lấy dữ liệu từ mảng gốc để lọc (Lúc này allJobs đã có dữ liệu)
    let filtered = [...this.allJobs];

    // Lọc theo Cấp bậc (Level) - Không phân biệt hoa/thường
    if (this.sidebarLevels.length > 0) {
      filtered = filtered.filter(job => {
        if (!job.level) return false; // Tránh lỗi nếu job.level null
        return this.sidebarLevels.some(lvl => 
          lvl.toLowerCase() === job.level.toLowerCase()
        );
      });
    }

    // Lọc theo Hình thức làm việc (jobType) - Không phân biệt hoa/thường
    if (this.sidebarModels.length > 0) {
      filtered = filtered.filter(job => {
        if (!job.jobType) return false; // Tránh lỗi nếu job.jobType null
        return this.sidebarModels.some(model => 
          model.toLowerCase() === job.jobType.toLowerCase()
        );
      });
    }

    // Lọc theo Mức lương
    if (this.selectedSalary > 0) {
      filtered = filtered.filter(job => 
        job.salaryMax >= this.selectedSalary
      );
    }

    // Cập nhật lại Signal để giao diện thay đổi
    this.jobs.set(filtered);

    // Tự động chọn Job đầu tiên trong danh sách mới
    if (filtered.length > 0) {
      this.selectedJob.set(filtered[0]);
    } else {
      this.selectedJob.set(null);
    }
  }


  resetFilters() {
  this.sidebarLevels = [];
  this.sidebarModels = [];
  this.selectedSalary = 0;
  
  // Hiển thị lại toàn bộ danh sách
  this.jobs.set(this.allJobs);
  if (this.allJobs.length > 0) {
    this.selectedJob.set(this.allJobs[0]);
  }

  // Đóng các dropdown nếu đang mở
  this.isLevelDropdownOpen = false;
  this.isModelDropdownOpen = false;
  
  console.log('Đã xóa toàn bộ bộ lọc');
}

  // --- BIẾN CHO SIDEBAR FILTER ---
  sidebarLevels: string[] = [];
  sidebarModels: string[] = [];
  selectedSalary: number = 0; 


    togglePill(type: string, value: string) {
    if (type === 'level') {
      const index = this.sidebarLevels.indexOf(value);
      if (index === -1) this.sidebarLevels.push(value);
      else this.sidebarLevels.splice(index, 1);
    } else if (type === 'model') {
      const index = this.sidebarModels.indexOf(value);
      if (index === -1) this.sidebarModels.push(value);
      else this.sidebarModels.splice(index, 1);
    }

    // QUAN TRỌNG: Gọi hàm lọc ngay lập tức sau khi thay đổi mảng
    this.applyFilters();
  }

  
  isPillSelected(type: string, value: string): boolean {
    let targetArray = type === 'level' ? this.sidebarLevels : this.sidebarModels;
    return targetArray.includes(value);
  }

  allJobs: any[] = [];
 
}