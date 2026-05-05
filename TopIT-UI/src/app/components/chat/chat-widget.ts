import {
  Component, OnInit, OnDestroy, Input, signal, inject,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessageDto } from '../../services/chat.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Nút mở chat -->
    <button class="btn-open-chat" (click)="toggleChat()" *ngIf="!isOpen()">
      <i class="bi bi-chat-dots-fill"></i>
      <span>Chat với nhà tuyển dụng</span>
      <span class="unread-dot" *ngIf="unreadCount() > 0">{{ unreadCount() }}</span>
    </button>

    <!-- Khung chat Offcanvas -->
    <div class="chat-panel" [class.open]="isOpen()">
      <!-- Header -->
      <div class="chat-panel-header">
        <div class="d-flex align-items-center gap-2">
          <div class="partner-avatar">{{ partnerInitial() }}</div>
          <div>
            <div class="partner-name">{{ partnerName }}</div>
            <div class="partner-status">
              <span class="dot" [class.online]="isConnected()"></span>
              {{ isConnected() ? 'Đang hoạt động' : 'Đang kết nối...' }}
            </div>
          </div>
        </div>
        <button class="btn-close-chat" (click)="toggleChat()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Lịch sử tin nhắn -->
      <div class="chat-panel-body" #scrollContainer>
        <div *ngIf="isLoading()" class="d-flex justify-content-center py-4">
          <div class="spinner-border spinner-border-sm text-primary"></div>
        </div>

        <div *ngIf="!isLoading() && messages().length === 0" class="empty-chat">
          <i class="bi bi-chat-square-dots"></i>
          <p>Bắt đầu cuộc trò chuyện!</p>
        </div>

        <div *ngFor="let msg of messages()" class="message-wrapper"
             [class.mine]="msg.senderId === currentUserId()">
          <div class="bubble">
            <p class="mb-0">{{ msg.content }}</p>
            <span class="msg-time">{{ msg.sentAt | date:'HH:mm' }}</span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-panel-footer">
        <input
          type="text"
          class="msg-input"
          [(ngModel)]="inputText"
          placeholder="Nhập tin nhắn..."
          (keydown.enter)="send()"
          [disabled]="!isConnected()"
        />
        <button class="btn-send" (click)="send()" [disabled]="!inputText.trim() || !isConnected()">
          <i class="bi bi-send-fill"></i>
        </button>
      </div>
    </div>

    <!-- Backdrop -->
    <div class="chat-backdrop" *ngIf="isOpen()" (click)="toggleChat()"></div>
  `,
  styles: [`
    /* ─── Nút mở chat ─────────────────────────────── */
    .btn-open-chat {
      display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white; border: none; border-radius: 12px;
      padding: 14px 20px; font-size: 15px; font-weight: 600;
      cursor: pointer; width: 100%; justify-content: center;
      box-shadow: 0 4px 14px rgba(37,99,235,0.4);
      transition: all 0.2s;
      position: relative;
      i { font-size: 18px; }
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.5); }
    }
    .unread-dot {
      position: absolute; top: -6px; right: -6px;
      background: #ef4444; color: white; font-size: 11px; font-weight: 700;
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white;
    }

    /* ─── Offcanvas Panel ─────────────────────────── */
    .chat-panel {
      position: fixed; top: 0; right: -480px; width: 420px; height: 100vh;
      background: #ffffff; z-index: 1055;
      display: flex; flex-direction: column;
      box-shadow: -6px 0 30px rgba(0,0,0,0.12);
      transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 1px solid #e2e8f0;
    }
    .chat-panel.open { right: 0; }

    .chat-panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 20px;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
    }
    .partner-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.25); font-weight: 700; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .partner-name { font-weight: 700; font-size: 15px; }
    .partner-status {
      font-size: 12px; opacity: 0.85; display: flex; align-items: center; gap: 5px;
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;
             &.online { background: #4ade80; box-shadow: 0 0 6px #4ade80; } }
    }
    .btn-close-chat {
      background: rgba(255,255,255,0.15); border: none; color: white;
      width: 34px; height: 34px; border-radius: 8px; font-size: 14px;
      cursor: pointer; transition: background 0.2s;
      &:hover { background: rgba(255,255,255,0.25); }
    }

    /* ─── Body ───────────────────────────────────── */
    .chat-panel-body {
      flex: 1; overflow-y: auto; padding: 20px 16px;
      display: flex; flex-direction: column; gap: 16px;
      background: #f8fafc;
    }
    .empty-chat {
      text-align: center; color: #94a3b8; padding-top: 80px;
      i { font-size: 56px; display: block; margin-bottom: 12px; opacity: 0.5; }
      p { font-size: 14px; }
    }
    .message-wrapper {
      display: flex;
      &.mine { justify-content: flex-end; }
    }
    .bubble {
      max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
      background: white; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;
      .mine & {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white; border: none; border-bottom-left-radius: 16px; border-bottom-right-radius: 4px;
      }
    }
    .msg-time { font-size: 11px; opacity: 0.6; display: block; text-align: right; margin-top: 4px; }

    /* ─── Footer ─────────────────────────────────── */
    .chat-panel-footer {
      padding: 14px 16px; border-top: 1px solid #e2e8f0;
      background: white; display: flex; gap: 10px; align-items: center;
    }
    .msg-input {
      flex: 1; border: 1px solid #e2e8f0; border-radius: 24px; padding: 10px 18px;
      font-size: 14px; outline: none; background: #f8fafc;
      transition: border-color 0.2s;
      &:focus { border-color: #2563eb; background: white; }
    }
    .btn-send {
      width: 42px; height: 42px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;
      font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; box-shadow: 0 3px 10px rgba(37,99,235,0.4);
      &:hover { transform: scale(1.08); }
      &:disabled { opacity: 0.5; cursor: default; transform: none; }
    }

    /* ─── Backdrop ──────────────────────────────── */
    .chat-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.35);
      backdrop-filter: blur(2px); z-index: 1050;
    }
  `]
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  /** ID của employer (người nhận). Truyền vào khi embed ở job-detail. */
  @Input() receiverId!: number;
  @Input() partnerName: string = 'Nhà tuyển dụng';
  @Input() jobId?: number;

  @ViewChild('scrollContainer') private scrollEl!: ElementRef;

  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  isLoading = signal(false);
  isConnected = signal(false);
  messages = signal<ChatMessageDto[]>([]);
  currentUserId = signal<number>(0);
  unreadCount = signal<number>(0);
  inputText = '';
  private sub?: Subscription;
  private shouldScroll = false;

  partnerInitial() {
    return this.partnerName?.charAt(0)?.toUpperCase() || 'N';
  }

  ngOnInit() {
    const uid = this.authService.getUserIdFromToken();
    if (uid) this.currentUserId.set(+uid);

    const token = localStorage.getItem('token');
    if (token) {
      this.chatService.startConnection(token);
    }

    this.chatService.isConnected.subscribe(v => this.isConnected.set(v));

    this.sub = this.chatService.messages$.subscribe(msg => {
      // Chỉ nhận tin nhắn thuộc cuộc hội thoại này
      if (
        (msg.senderId === this.receiverId && msg.receiverId === this.currentUserId()) ||
        (msg.senderId === this.currentUserId() && msg.receiverId === this.receiverId)
      ) {
        this.messages.update(list => [...list, msg]);
        this.shouldScroll = true;
        // Nếu chat đang đóng, tăng unread
        if (!this.isOpen() && msg.senderId === this.receiverId) {
          this.unreadCount.update(c => c + 1);
        }
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleChat() {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.unreadCount.set(0);
      this.loadHistory();
    }
  }

  private loadHistory() {
    if (!this.receiverId) return;
    this.isLoading.set(true);
    this.chatService.getMessages(this.receiverId, this.jobId).subscribe({
      next: msgs => {
        this.messages.set(msgs);
        this.isLoading.set(false);
        this.shouldScroll = true;
      },
      error: () => this.isLoading.set(false)
    });
  }

  send() {
    const text = this.inputText.trim();
    if (!text || !this.receiverId) return;
    this.chatService.sendMessage(this.receiverId, text, this.jobId);
    this.inputText = '';
  }

  private scrollToBottom() {
    try {
      const el = this.scrollEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
