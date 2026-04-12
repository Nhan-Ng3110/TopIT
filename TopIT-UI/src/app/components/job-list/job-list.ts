import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job'; 
import { ApplicationService } from '../../services/application'; 

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private appService = inject(ApplicationService); 

  // --- UI CONTROLS ---
  isOffcanvasOpen = false;
  isLevelDropdownOpen = false;
  isModelDropdownOpen = false;
  isLocationDropdownOpen = false;

  // --- LOCATION DATA ---
  provinces = [
    { id: 1, name: 'Hà Nội' },
    { id: 2, name: 'Hồ Chí Minh' },
    { id: 3, name: 'Đà Nẵng' },
    { id: 4, name: 'Bình Dương' },
    { id: 5, name: 'Đồng Nai' }
  ];

  districtsMap: { [key: number]: string[] } = {
    1: ['Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Vì', 'Thạch Thất', 'Sơn Tây'],
    2: ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Thủ Đức'],
    3: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'],
    4: ['Thủ Dầu Một', 'Thuận An', 'Dĩ An', 'Bến Cát', 'Tân Uyên'],
    5: ['Biên Hòa', 'Long Khánh', 'Nhơn Trạch', 'Trảng Bom']
  };

  selectedProvinceId: number | null = 1;
  provinceSearchKeyword = '';
  districtSearchKeyword = '';
  tempSelectedLocations: string[] = [];

  // --- FILTER STATE ---
  sidebarLevels: string[] = [];
  sidebarModels: string[] = [];
  selectedSalary: number = 0; 
  
  jobs = signal<any[]>([]);
  allJobs: any[] = [];
  selectedJob = signal<any>(null);

  searchFilter = {
    keyWord: '',
    location: '',
    salaryMin: null
  };

  ngOnInit() {
    this.onSearch();
  }

  onSelectJob(job: any) {
    this.selectedJob.set(job);
  }

  onSearch() {
    this.jobService.getJobs(this.searchFilter).subscribe({
      next: (data: any) => {
        this.allJobs = data; 
        this.jobs.set(data);
        if (data && data.length > 0) {
          this.selectedJob.set(data[0]); 
        }
      },
      error: (err) => console.error('Lỗi kết nối API:', err)
    });
  }

  toggleDropdown(type: string) {
    if (type === 'level') {
      this.isLevelDropdownOpen = !this.isLevelDropdownOpen;
      this.isModelDropdownOpen = false;
      this.isLocationDropdownOpen = false;
    } else if (type === 'model') {
      this.isModelDropdownOpen = !this.isModelDropdownOpen;
      this.isLevelDropdownOpen = false;
      this.isLocationDropdownOpen = false;
    } else if (type === 'location') {
      this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
      this.isLevelDropdownOpen = false;
      this.isModelDropdownOpen = false;
      if (this.isLocationDropdownOpen) {
        this.tempSelectedLocations = this.searchFilter.location ? this.searchFilter.location.split(', ') : [];
      }
    }
  }

  // --- LOCATION LOGIC ---
  get filteredProvinces() {
    return this.provinces.filter(p => p.name.toLowerCase().includes(this.provinceSearchKeyword.toLowerCase()));
  }

  get filteredDistricts() {
    const districts = this.selectedProvinceId ? this.districtsMap[this.selectedProvinceId] || [] : [];
    return districts.filter(d => d.toLowerCase().includes(this.districtSearchKeyword.toLowerCase()));
  }

  selectProvince(id: number) {
    this.selectedProvinceId = id;
    this.districtSearchKeyword = ''; // Reset tìm kiếm quận khi đổi tỉnh
  }

  toggleProvinceSelection(id: number, event: any) {
    event.stopPropagation();
    const province = this.provinces.find(p => p.id === id);
    if (!province) return;

    const districts = this.districtsMap[id] || [];
    const allSelected = districts.every(d => this.tempSelectedLocations.includes(d));

    if (allSelected) {
      // Bỏ chọn tất cả quận thuộc tỉnh này
      this.tempSelectedLocations = this.tempSelectedLocations.filter(loc => !districts.includes(loc));
    } else {
      // Chọn tất cả quận thuộc tỉnh này (không trùng lặp)
      districts.forEach(d => {
        if (!this.tempSelectedLocations.includes(d)) this.tempSelectedLocations.push(d);
      });
    }
  }

  isProvinceSelected(id: number): boolean {
    const districts = this.districtsMap[id] || [];
    return districts.length > 0 && districts.every(d => this.tempSelectedLocations.includes(d));
  }

  toggleLocationSelection(loc: string, event: any) {
    event.stopPropagation();
    const index = this.tempSelectedLocations.indexOf(loc);
    if (index === -1) this.tempSelectedLocations.push(loc);
    else this.tempSelectedLocations.splice(index, 1);
  }

  isLocationSelected(loc: string): boolean {
    return this.tempSelectedLocations.includes(loc);
  }

  clearTempLocations() {
    this.tempSelectedLocations = [];
  }

  applyLocationFilter() {
    this.searchFilter.location = this.tempSelectedLocations.join(', ');
    this.isLocationDropdownOpen = false;
    this.onSearch();
  }

  // --- FILTER HELPERS ---
  getDropdownText(type: string): string {
    const selectedList = type === 'level' ? this.sidebarLevels : this.sidebarModels;
    const defaultName = type === 'level' ? 'Cấp bậc' : 'Hình thức';
    if (selectedList.length === 0) return defaultName;
    if (selectedList.length === 1) return selectedList[0];
    return `${selectedList[0]} +${selectedList.length - 1}`;
  }

  toggleFilterMenu() {
    this.isOffcanvasOpen = !this.isOffcanvasOpen;
  }

  applyFilters() {
    let filtered = [...this.allJobs];
    if (this.sidebarLevels.length > 0) {
      filtered = filtered.filter(job => job.level && this.sidebarLevels.some(lvl => lvl.toLowerCase() === job.level.toLowerCase()));
    }
    if (this.sidebarModels.length > 0) {
      filtered = filtered.filter(job => job.jobType && this.sidebarModels.some(model => model.toLowerCase() === job.jobType.toLowerCase()));
    }
    if (this.selectedSalary > 0) {
      filtered = filtered.filter(job => job.salaryMax >= this.selectedSalary);
    }
    this.jobs.set(filtered);
    if (filtered.length > 0) this.selectedJob.set(filtered[0]);
    else this.selectedJob.set(null);
  }

  resetFilters() {
    this.sidebarLevels = [];
    this.sidebarModels = [];
    this.selectedSalary = 0;
    this.jobs.set(this.allJobs);
    if (this.allJobs.length > 0) this.selectedJob.set(this.allJobs[0]);
    this.isLevelDropdownOpen = false;
    this.isModelDropdownOpen = false;
  }

  togglePill(type: string, value: string) {
    let targetArray = type === 'level' ? this.sidebarLevels : this.sidebarModels;
    const index = targetArray.indexOf(value);
    if (index === -1) targetArray.push(value);
    else targetArray.splice(index, 1);
    this.applyFilters();
  }

  isPillSelected(type: string, value: string): boolean {
    let targetArray = type === 'level' ? this.sidebarLevels : this.sidebarModels;
    return targetArray.includes(value);
  }

  // Phục vụ giao diện cũ/khác
  onFileSelected(event: any) {}
  apply(jobId: number) {}
}