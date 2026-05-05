import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employer-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="messages-layout-container">
      <!-- Cột Trái: Danh sách hội thoại -->
      <aside class="contacts-sidebar">
        <div class="sidebar-header">
          <h4 class="fw-bold mb-3">Tin nhắn</h4>
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control" placeholder="Tìm kiếm ứng viên...">
          </div>
        </div>
        
        <div class="contact-list">
          @for (contact of contacts(); track contact.id) {
            <div class="contact-item" 
                 [class.active]="activeContact()?.id === contact.id"
                 (click)="selectContact(contact)">
              <div class="avatar bg-primary-light text-primary fw-bold d-flex align-items-center justify-content-center">
                {{ contact.name.charAt(0) }}
              </div>
              <div class="contact-info">
                <div class="contact-name">
                  <span class="fw-semibold text-truncate">{{ contact.name }}</span>
                  <span class="time">{{ contact.time }}</span>
                </div>
                <div class="last-message-row">
                  <span class="last-message" [class.fw-bold]="contact.unread > 0">{{ contact.lastMessage }}</span>
                  @if (contact.unread > 0) {
                    <span class="unread-badge">{{ contact.unread }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </aside>

      <!-- Cột Phải: Khung Chat Chính -->
      <main class="chat-room">
        @if (activeContact()) {
          <div class="room-header">
            <div class="avatar bg-primary-light text-primary fw-bold d-flex align-items-center justify-content-center fs-5">
              {{ activeContact().name.charAt(0) }}
            </div>
            <div class="room-title">
              <h6 class="mb-0 fw-bold">{{ activeContact().name }}</h6>
              <span class="status online">Đang hoạt động</span>
            </div>
          </div>
          
          <div class="room-body">
            <div class="message received">
              <p>Dạ em chào nhà tuyển dụng ạ.</p>
              <span class="time">10:28</span>
            </div>
            <div class="message sent">
              <p>Chào em, mời em thứ 2 tuần sau qua văn phòng nhé!</p>
              <span class="time">10:30</span>
            </div>
          </div>

          <div class="room-footer">
            <button class="btn-icon"><i class="bi bi-paperclip"></i></button>
            <button class="btn-icon"><i class="bi bi-emoji-smile"></i></button>
            <input type="text" placeholder="Nhập tin nhắn của bạn..." class="form-control rounded-pill" />
            <button class="btn btn-primary btn-send rounded-circle"><i class="bi bi-send-fill"></i></button>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="no-chat-selected">
            <i class="bi bi-chat-square-dots empty-icon"></i>
            <p class="fs-5 fw-medium text-secondary">Chọn một hội thoại để bắt đầu nhắn tin</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .messages-layout-container {
      display: flex; height: calc(100vh - 100px); background: #fff; border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #eaeaea;
    }
    .contacts-sidebar { width: 340px; border-right: 1px solid #eaeaea; display: flex; flex-direction: column; background: #fbfbfc; }
    .contacts-sidebar .sidebar-header { padding: 24px 20px 16px; background: #fff; border-bottom: 1px solid #eaeaea; }
    .contacts-sidebar .search-box { position: relative; }
    .contacts-sidebar .search-box i { position: absolute; left: 14px; top: 10px; color: #999; }
    .contacts-sidebar .search-box input { padding-left: 36px; border-radius: 20px; background: #f5f6f8; border: none; }
    .contacts-sidebar .contact-list { flex: 1; overflow-y: auto; }
    .contacts-sidebar .contact-item { display: flex; padding: 16px 20px; gap: 14px; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f0f0f0; }
    .contacts-sidebar .contact-item:hover { background: #f4f7f9; }
    .contacts-sidebar .contact-item.active { background: #e9f2ff; border-right: 3px solid #0d6efd; }
    .contacts-sidebar .contact-item .avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
    .bg-primary-light { background: #e0e7ff; }
    .contacts-sidebar .contact-item .contact-info { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
    .contacts-sidebar .contact-item .contact-name { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .contacts-sidebar .contact-item .contact-name .time { font-size: 12px; color: #888; }
    .contacts-sidebar .contact-item .last-message-row { display: flex; justify-content: space-between; align-items: center; }
    .contacts-sidebar .contact-item .last-message { font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .contacts-sidebar .contact-item .unread-badge { background: #ef4444; color: #fff; font-size: 11px; font-weight: bold; padding: 2px 7px; border-radius: 12px; }
    
    .chat-room { flex: 1; display: flex; flex-direction: column; background: #fff; }
    .chat-room .room-header { padding: 16px 24px; border-bottom: 1px solid #eaeaea; display: flex; align-items: center; gap: 14px; }
    .chat-room .room-header .avatar { width: 44px; height: 44px; border-radius: 50%; }
    .chat-room .room-header .status { font-size: 13px; color: #10b981; }
    .chat-room .room-body { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; background: #f8fafc; }
    .chat-room .room-body .message { max-width: 60%; padding: 12px 18px; border-radius: 14px; position: relative; }
    .chat-room .room-body .message p { margin: 0; font-size: 14.5px; line-height: 1.5; }
    .chat-room .room-body .message .time { font-size: 11px; display: block; text-align: right; margin-top: 6px; }
    .chat-room .room-body .message.received { align-self: flex-start; background: #fff; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; color: #334155; }
    .chat-room .room-body .message.received .time { color: #94a3b8; }
    .chat-room .room-body .message.sent { align-self: flex-end; background: #0d6efd; color: white; border-bottom-right-radius: 4px; }
    .chat-room .room-body .message.sent .time { color: rgba(255,255,255,0.7); }
    .chat-room .room-footer { padding: 16px 24px; border-top: 1px solid #eaeaea; display: flex; align-items: center; gap: 12px; background: #fff; }
    .chat-room .room-footer input { flex: 1; padding: 12px 20px; border: 1px solid #e2e8f0; background: #f8fafc; }
    .chat-room .room-footer input:focus { box-shadow: none; border-color: #cbd5e1; }
    .chat-room .room-footer .btn-icon { background: none; border: none; color: #64748b; font-size: 22px; cursor: pointer; transition: color 0.2s; }
    .chat-room .room-footer .btn-icon:hover { color: #0d6efd; }
    .chat-room .room-footer .btn-send { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .chat-room .no-chat-selected { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; }
    .chat-room .no-chat-selected .empty-icon { font-size: 80px; margin-bottom: 20px; color: #cbd5e1; }
  `]
})
export class EmployerMessagesComponent {
  contacts = signal([
    { id: 1, name: 'Nguyễn Văn A', lastMessage: 'Cảm ơn anh/chị!', time: '10:30', unread: 2 },
    { id: 2, name: 'Trần Thị B', lastMessage: 'Dạ vâng ạ, hẹn gặp anh.', time: 'Hôm qua', unread: 0 }
  ]);
  
  activeContact = signal<any>(null);

  selectContact(contact: any) {
    this.activeContact.set(contact);
    contact.unread = 0; 
  }
}
