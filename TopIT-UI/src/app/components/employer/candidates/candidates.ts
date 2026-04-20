import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../services/notification';
import { FormsModule } from '@angular/forms';

const API_BASE_URL = 'https://localhost:7151';

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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="candidates-page animate-fade">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Quản lý ứng viên</h2>
          <p class="text-muted small">Theo dõi và phản hồi hồ sơ ứng tuyển từ các ứng viên</p>
        </div>
        <div class="actions-group d-flex gap-2">
           <button class="btn btn-outline-secondary rounded-pill px-4" (click)="loadCandidates()">
             <i class="bi bi-arrow-clockwise"></i> Làm mới
           </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="status-filters-card card-premium mb-4 p-3">
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-filter" [class.active]="currentFilter() === 'All'" (click)="setFilter('All')">Tất cả</button>
          <button class="btn btn-filter" [class.active]="currentFilter() === 'Pending'" (click)="setFilter('Pending')">Chưa xem</button>
          <button class="btn btn-filter" [class.active]="currentFilter() === 'Accepted'" (click)="setFilter('Accepted')">Đã duyệt</button>
          <button class="btn btn-filter" [class.active]="currentFilter() === 'Interview'" (click)="setFilter('Interview')">Hẹn phỏng vấn</button>
          <button class="btn btn-filter" [class.active]="currentFilter() === 'Rejected'" (click)="setFilter('Rejected')">Đã từ chối</button>
        </div>
      </div>

      <!-- Candidates Table -->
      <div class="table-container card-premium overflow-hidden">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4 py-3">Ứng viên</th>
              <th class="py-3">Vị trí</th>
              <th class="py-3">Ngày nộp</th>
              <th class="py-3">CV</th>
              <th class="py-3">Trạng thái</th>
              <th class="pe-4 py-3 text-end">Hành động nhanh</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filteredCandidates()" class="candidate-row hover-glow">
              <td class="ps-4">
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-sm bg-primary-light text-primary fw-bold">
                    {{ app.candidateName.charAt(0) }}
                  </div>
                  <div>
                    <div class="fw-bold text-main">{{ app.candidateName }}</div>
                    <div class="text-muted smallest truncate-70">{{ app.message || 'Không có lời nhắn' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-soft-info text-info">{{ app.jobTitle }}</span>
              </td>
              <td>
                <span class="text-muted small">{{ app.appliedAt | date:'dd/MM/yyyy' }}</span>
              </td>
              <td>
                <a [href]="app.cvUrl" target="_blank" class="btn-view-cv text-primary">
                  <i class="bi bi-file-earmark-pdf"></i> Xem CV
                </a>
              </td>
              <td>
                <span class="status-pill" [class]="app.status.toLowerCase()">
                  {{ getStatusLabel(app.status) }}
                </span>
              </td>
              <td class="pe-4 text-end">
                <div class="quick-actions-box">
                  <button class="btn-action approve" (click)="updateStatus(app.id, 'Accepted')" title="Duyệt">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button class="btn-action interview" (click)="updateStatus(app.id, 'Interview')" title="Hẹn phỏng vấn">
                    <i class="bi bi-calendar-event"></i>
                  </button>
                  <button class="btn-action reject" (click)="updateStatus(app.id, 'Rejected')" title="Từ chối">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="filteredCandidates().length === 0">
              <td colspan="6" class="text-center py-5">
                <div class="empty-state">
                  <i class="bi bi-inbox text-muted display-4"></i>
                  <p class="mt-3 text-muted">Không tìm thấy ứng viên nào phù hợp</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .bg-primary-light { background: #e0e7ff; }
    .bg-soft-info { background: #e0f2fe; }
    .text-info { color: #0369a1; }
    .truncate-70 { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .btn-filter {
      border: 1px solid #e2e8f0; border-radius: 100px; padding: 6px 18px; font-size: 0.9rem; font-weight: 600; color: #64748b; background: white; transition: all 0.2s;
      &.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }
      &:hover:not(.active) { background: #f1f5f9; color: #2563eb; }
    }

    .status-pill {
      display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      &.pending { background: #fef3c7; color: #92400e; }
      &.accepted { background: #dcfce7; color: #166534; }
      &.interview { background: #e0e7ff; color: #3730a3; }
      &.rejected { background: #fee2e2; color: #991b1b; }
      &.viewed { background: #f3f4f6; color: #374151; }
    }

    .quick-actions-box {
      display: flex; gap: 8px; justify-content: flex-end;
      .btn-action {
        width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        &.approve { background: #f0fdf4; color: #22c55e; &:hover { background: #22c55e; color: white; } }
        &.interview { background: #f5f3ff; color: #8b5cf6; &:hover { background: #8b5cf6; color: white; } }
        &.reject { background: #fef2f2; color: #ef4444; &:hover { background: #ef4444; color: white; } }
      }
    }
  `]
})
export class EmployerCandidatesComponent implements OnInit {
  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  candidates = signal<CandidateApplication[]>([]);
  currentFilter = signal<string>('All');

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
    this.http.get<CandidateApplication[]>(`${API_BASE_URL}/api/applications/employer-all`).subscribe({
      next: (res) => this.candidates.set(res),
      error: () => this.notification.error('Không thể tải danh sách ứng viên')
    });
  }

  setFilter(filter: string) {
    this.currentFilter.set(filter);
  }

  updateStatus(id: number, status: string) {
    this.http.put(`${API_BASE_URL}/api/applications/${id}/status`, { status }).subscribe({
      next: () => {
        this.notification.success(`Đã cập nhật trạng thái: ${this.getStatusLabel(status)}`);
        // Cập nhật state tại chỗ dùng signal
        this.candidates.update(list => list.map((c: CandidateApplication) => c.id === id ? { ...c, status } : c));
      },
      error: () => this.notification.error('Lỗi cập nhật trạng thái')
    });
  }

  getStatusLabel(status: string) {
    const map: Record<string, string> = {
      'Pending': 'Chưa xem',
      'Viewed': 'Đã xem',
      'Accepted': 'Đã duyệt',
      'Interview': 'Hẹn phỏng vấn',
      'Rejected': 'Từ chối'
    };
    return map[status] || status;
  }
}
