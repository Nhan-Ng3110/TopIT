import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../services/application';
import { NotificationService } from '../../../services/notification';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '../../../shared/pipes/safe.pipe';

interface CandidateApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateName: string;
  message: string;
  status: string;
  appliedAt: string;
  cvUrl: string;
}

@Component({
  selector: 'app-employer-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  template: `
    <div class="candidates-page animate-fade">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Quản lý ứng viên</h2>
          <p class="text-muted small">Xem và phản hồi hồ sơ ứng tuyển (Master-Detail)</p>
        </div>
      </div>

      <div class="row g-4 h-100">
        <!-- Master Column (Left) -->
        <div class="col-lg-4 d-flex flex-column gap-3">
          <!-- Filters -->
          <div class="status-filters-card card-premium p-3">
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-filter" [class.active]="currentFilter() === 'All'" (click)="setFilter('All')">Tất cả</button>
              <button class="btn btn-filter" [class.active]="currentFilter() === 'Pending'" (click)="setFilter('Pending')">Chưa xem</button>
              <button class="btn btn-filter" [class.active]="currentFilter() === 'Viewed'" (click)="setFilter('Viewed')">Đã xem</button>
              <button class="btn btn-filter" [class.active]="currentFilter() === 'Interview'" (click)="setFilter('Interview')">Phỏng vấn</button>
              <button class="btn btn-filter" [class.active]="currentFilter() === 'Accepted'" (click)="setFilter('Accepted')">Đã duyệt</button>
              <button class="btn btn-filter" [class.active]="currentFilter() === 'Rejected'" (click)="setFilter('Rejected')">Từ chối</button>
            </div>
          </div>

          <!-- List -->
          <div class="list-container card-premium flex-grow-1 overflow-auto" style="max-height: 700px;">
            <div class="list-group list-group-flush">
              <button *ngFor="let app of filteredCandidates()" 
                      class="list-group-item list-group-item-action candidate-item hover-glow p-3 border-bottom"
                      [class.active-item]="selectedCandidate()?.id === app.id"
                      (click)="selectCandidate(app)">
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-md bg-primary-light text-primary fw-bold fs-5">
                    {{ app.candidateName.charAt(0) }}
                  </div>
                  <div class="flex-grow-1 overflow-hidden text-start">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h6 class="fw-bold mb-0 text-truncate" [class.text-white]="selectedCandidate()?.id === app.id">{{ app.candidateName }}</h6>
                      <span class="small opacity-75" [class.text-white]="selectedCandidate()?.id === app.id">{{ app.appliedAt | date:'dd/MM' }}</span>
                    </div>
                    <div class="small text-truncate mb-2 opacity-75" [class.text-white]="selectedCandidate()?.id === app.id">{{ app.jobTitle }}</div>
                    <span class="status-pill" [class]="app.status.toLowerCase()">{{ getStatusLabel(app.status) }}</span>
                  </div>
                </div>
              </button>

              <div *ngIf="filteredCandidates().length === 0" class="p-4 text-center text-muted">
                <i class="bi bi-inbox display-4 opacity-25"></i>
                <p class="mt-2">Không có ứng viên nào</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Column (Right) -->
        <div class="col-lg-8">
          <div class="card-premium h-100 d-flex flex-column" *ngIf="selectedCandidate() as selected">
            
            <!-- Action Bar -->
            <div class="action-bar p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top">
              <div class="d-flex align-items-center gap-3">
                <div class="avatar-sm bg-white text-primary fw-bold shadow-sm">
                  {{ selected.candidateName.charAt(0) }}
                </div>
                <div>
                  <h5 class="fw-bold mb-0">{{ selected.candidateName }}</h5>
                  <div class="text-muted small">Ứng tuyển: {{ selected.jobTitle }}</div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary shadow-sm hover-glow" (click)="updateStatus(selected.id, 'Accepted')">
                  <i class="bi bi-check-circle me-1"></i> Duyệt
                </button>
                <button class="btn btn-info text-white shadow-sm hover-glow" (click)="updateStatus(selected.id, 'Interview')">
                  <i class="bi bi-calendar-event me-1"></i> Phỏng vấn
                </button>
                <button class="btn btn-danger shadow-sm hover-glow" (click)="updateStatus(selected.id, 'Rejected')">
                  <i class="bi bi-x-circle me-1"></i> Từ chối
                </button>
              </div>
            </div>

            <!-- Message Area -->
            <div class="p-3 bg-white border-bottom" *ngIf="selected.message">
              <p class="mb-0 text-muted"><strong>Lời nhắn: </strong> <i>"{{ selected.message }}"</i></p>
            </div>

            <!-- Embedded PDF Viewer -->
            <div class="pdf-container flex-grow-1 bg-dark rounded-bottom overflow-hidden" style="min-height: 600px;">
              <object [data]="selected.cvUrl | safe" type="application/pdf" width="100%" height="100%">
                <p class="text-white text-center p-5">Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp. 
                  <a [href]="selected.cvUrl" class="text-primary" target="_blank">Tải xuống CV tại đây</a>.
                </p>
              </object>
            </div>

          </div>

          <div class="card-premium h-100 d-flex align-items-center justify-content-center p-5 text-muted" *ngIf="!selectedCandidate()">
            <div class="text-center">
              <i class="bi bi-file-earmark-person display-1 opacity-25"></i>
              <h4 class="mt-3">Chọn một ứng viên để xem chi tiết</h4>
              <p>Danh sách bên trái chứa các hồ sơ đã nộp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-md { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .avatar-sm { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .bg-primary-light { background: #e0e7ff; }

    .btn-filter {
      border: 1px solid #e2e8f0; border-radius: 100px; padding: 4px 12px; font-size: 0.85rem; font-weight: 600; color: #64748b; background: white; transition: all 0.2s;
      &.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
      &:hover:not(.active) { background: #f1f5f9; color: #2563eb; }
    }

    .candidate-item {
      transition: all 0.2s; cursor: pointer; border: none !important; margin-bottom: 2px;
      &.active-item {
        background: #3b82f6 !important; color: white !important; border-radius: 8px; transform: scale(1.02); box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); z-index: 10;
        .status-pill { border: 1px solid rgba(255,255,255,0.5); }
      }
    }

    .status-pill {
      display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 100px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      &.pending { background: #fef3c7; color: #92400e; }
      &.accepted { background: #dcfce7; color: #166534; }
      &.interview { background: #e0e7ff; color: #3730a3; }
      &.rejected { background: #fee2e2; color: #991b1b; }
      &.viewed { background: #f3f4f6; color: #374151; }
    }

    .pdf-container { position: relative; }
  `]
})
export class EmployerCandidatesComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private notification = inject(NotificationService);

  candidates = signal<CandidateApplication[]>([]);
  currentFilter = signal<string>('All');
  selectedCandidate = signal<CandidateApplication | null>(null);

  filteredCandidates = computed(() => {
    const list = this.candidates();
    const filter = this.currentFilter();
    if (filter === 'All') return list;
    return list.filter((c: CandidateApplication) => c.status === filter);
  });

  ngOnInit() {
    this.loadCandidates();
  }

  loadCandidates() {
    this.applicationService.getEmployerApplications().subscribe({
      next: (res) => {
        this.candidates.set(res);
        if (res.length > 0 && !this.selectedCandidate()) {
          this.selectedCandidate.set(res[0]); // Auto select first
        }
      },
      error: () => this.notification.error('Không thể tải danh sách ứng viên')
    });
  }

  setFilter(filter: string) {
    this.currentFilter.set(filter);
    const filtered = this.filteredCandidates();
    if (filtered.length > 0) {
      this.selectedCandidate.set(filtered[0]);
    } else {
      this.selectedCandidate.set(null);
    }
  }

  selectCandidate(app: CandidateApplication) {
    this.selectedCandidate.set(app);
    if (app.status === 'Pending') {
      this.updateStatus(app.id, 'Viewed', false);
    }
  }

  updateStatus(id: number, status: string, showNotify = true) {
    this.applicationService.updateApplicationStatus(id, status).subscribe({
      next: () => {
        if (showNotify) {
          this.notification.success(`Đã cập nhật trạng thái: ${this.getStatusLabel(status)}`);
        }
        
        // Update Signal state
        this.candidates.update(list => list.map(c => c.id === id ? { ...c, status } : c));
        
        // Update selected if needed
        const selected = this.selectedCandidate();
        if (selected && selected.id === id) {
          this.selectedCandidate.set({ ...selected, status });
        }
      },
      error: () => {
        if (showNotify) this.notification.error('Lỗi cập nhật trạng thái');
      }
    });
  }

  getStatusLabel(status: string) {
    const map: Record<string, string> = {
      'Pending': 'Chưa xem',
      'Viewed': 'Đã xem',
      'Accepted': 'Đã duyệt',
      'Interview': 'Phỏng vấn',
      'Rejected': 'Từ chối'
    };
    return map[status] || status;
  }
}
