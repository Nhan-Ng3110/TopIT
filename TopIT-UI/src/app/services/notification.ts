import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string, title: string = 'Thành công') {
    this.show({ message, title, type: 'success' });
  }

  error(message: string, title: string = 'Lỗi') {
    this.show({ message, title, type: 'error' });
  }

  info(message: string, title: string = 'Thông báo') {
    this.show({ message, title, type: 'info' });
  }

  warning(message: string, title: string = 'Cảnh báo') {
    this.show({ message, title, type: 'warning' });
  }

  private show(toast: Omit<Toast, 'id'>) {
    const id = this.counter++;
    const newToast: Toast = { ...toast, id, duration: toast.duration || 3000 };
    
    this.toasts.update(current => [...current, newToast]);

    if (newToast.duration !== Infinity) {
      setTimeout(() => this.remove(id), newToast.duration);
    }
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
