import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JobService } from '../../../services/job';
import { NotificationService } from '../../../services/notification';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-form.html',
  styleUrls: ['./job-form.scss']
})
export class JobFormComponent {
  @Output() jobCreated = new EventEmitter<any>();
  @Output() formClosed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private notificationService = inject(NotificationService);

  jobForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    requirements: [''],
    benefits: [''],
    location: ['Hồ Chí Minh', Validators.required],
    salaryMin: [null, [Validators.min(0)]],
    salaryMax: [null, [Validators.min(0)]],
    isNegotiable: [false],
    level: ['Junior', Validators.required],
    jobType: ['Full-time', Validators.required],
    experienceYears: [0, [Validators.required, Validators.min(0)]]
  });

  isSubmitting = false;

  onSubmit() {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    const formValues = this.jobForm.value;
    if (formValues.salaryMin && formValues.salaryMax && formValues.salaryMax < formValues.salaryMin) {
      this.notificationService.error('Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu');
      return;
    }

    this.isSubmitting = true;
    this.jobService.createJob(formValues).subscribe({
      next: (res) => {
        this.notificationService.success('Đăng tin tuyển dụng thành công!');
        this.isSubmitting = false;
        this.jobCreated.emit(res);
        this.jobForm.reset({ location: 'Hồ Chí Minh', level: 'Junior', jobType: 'Full-time', experienceYears: 0 });
      },
      error: (err) => {
        this.notificationService.error(err.error || 'Có lỗi xảy ra khi đăng tin');
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.formClosed.emit();
  }
}
