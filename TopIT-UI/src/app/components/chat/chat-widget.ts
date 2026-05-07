import {
  Component, OnInit, OnDestroy, Input, signal, inject,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessageDto } from '../../services/chat.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  /** ID của employer (người nhận). Truyền vào khi embed ở job-detail. */
  @Input() receiverId!: number;
  @Input() partnerName: string = 'Nhà tuyển dụng';
  @Input() jobId?: number;
  /** CompanyId dùng để fallback fetch EmployerUserId nếu receiverId chưa có */
  @Input() companyId?: number;

  /** True nếu receiverId hợp lệ (là user ID thực sự của Employer) */
  get isReceiverValid(): boolean {
    return !!this.receiverId && this.receiverId > 0;
  }

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

  // --- Typing Indicator State (ready for SignalR integration) ---
  isPartnerTyping = false;
  private typingTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  // --- Quick Replies ---
  quickReplies: string[] = [
    'Dạ em gửi CV ạ',
    'Anh/chị cần thêm thông tin gì không ạ?',
    'Thời gian phỏng vấn như thế nào ạ?',
    'Dạ em cảm ơn anh/chị!'
  ];

  partnerInitial() {
    return this.partnerName?.charAt(0)?.toUpperCase() || 'N';
  }

  ngOnInit() {
    const uid = this.authService.getUserIdFromToken();
    if (uid) this.currentUserId.set(+uid);

    if (!this.authService.isAuthenticated()) return;

    const token = localStorage.getItem('topit_token');
    if (token) {
      this.chatService.startConnection(token);
    }

    this.chatService.isConnected.subscribe(v => this.isConnected.set(v));

    this.sub = this.chatService.messages$.subscribe(msg => {
      // Chỉ nhận tin nhắn thuộc cuộc hội thoại này (dùng == để tránh lỗi so sánh string/number)
      if (
        (msg.senderId == this.receiverId && msg.receiverId == this.currentUserId()) ||
        (msg.senderId == this.currentUserId() && msg.receiverId == this.receiverId)
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
    if (!this.authService.isAuthenticated()) return;

    // Nếu receiverId chưa hợp lệ, thử fetch từ API trước
    if (!this.isReceiverValid && this.companyId) {
      this.isLoading.set(true);
      this.chatService.getEmployerUserId(this.companyId).subscribe({
        next: (res) => {
          if (res.employerUserId) {
            this.receiverId = res.employerUserId;
          }
          this.isLoading.set(false);
          this.openChatPanel();
        },
        error: () => {
          this.isLoading.set(false);
          this.openChatPanel();
        }
      });
      return;
    }

    this.openChatPanel();
  }

  private openChatPanel() {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.unreadCount.set(0);
      if (this.isReceiverValid) {
        this.loadHistory();
      }
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
    try {
      this.chatService.sendMessage(this.receiverId, text, this.jobId);
      this.inputText = '';
      this.shouldScroll = true;

      // Reset textarea height after sending
      const textarea = this.scrollEl?.nativeElement
        ?.parentElement?.querySelector('textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
    }
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.send();
  }

  sendQuickReply(text: string) {
    this.inputText = text;
    this.send();
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    
    // Mock typing indicator trigger
    if (this.inputText.trim().length > 0) {
      // Typically we'd emit 'typing' event via SignalR here
    }
  }

  // --- Grouping Logic ---

  isConsecutive(index: number): boolean {
    if (index === 0) return false;
    const currentMsg = this.messages()[index];
    const prevMsg = this.messages()[index - 1];
    
    // Group if same sender and sent within 5 minutes (300000ms)
    const sameSender = currentMsg.senderId === prevMsg.senderId;
    const timeDiff = new Date(currentMsg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime();
    
    return sameSender && timeDiff < 300000;
  }

  isLastInGroup(index: number): boolean {
    if (index === this.messages().length - 1) return true;
    const currentMsg = this.messages()[index];
    const nextMsg = this.messages()[index + 1];
    
    const sameSender = currentMsg.senderId === nextMsg.senderId;
    const timeDiff = new Date(nextMsg.sentAt).getTime() - new Date(currentMsg.sentAt).getTime();
    
    return !(sameSender && timeDiff < 300000);
  }

  showTimeDivider(index: number): boolean {
    if (index === 0) return true;
    const currentMsg = this.messages()[index];
    const prevMsg = this.messages()[index - 1];
    
    // Show time divider if message is more than 1 hour apart
    const timeDiff = new Date(currentMsg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime();
    return timeDiff > 3600000;
  }

  // --- Mock Features ---
  
  mockPartnerTyping() {
    this.isPartnerTyping = true;
    if (this.typingTimeout !== undefined) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isPartnerTyping = false;
    }, 3000);
  }

  private scrollToBottom() {
    try {
      const el = this.scrollEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
