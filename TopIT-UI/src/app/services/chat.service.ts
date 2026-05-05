import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

export interface ChatMessageDto {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  jobId?: number;
}

export interface ConversationDto {
  partnerId: number;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  jobId?: number;
  jobTitle?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = 'https://localhost:7151/api/chat';
  private readonly HUB_URL = 'https://localhost:7151/chatHub';

  private http = inject(HttpClient);

  private hubConnection?: signalR.HubConnection;

  /** Stream tin nhắn đến (real-time) */
  private messageSubject = new Subject<ChatMessageDto>();
  public messages$ = this.messageSubject.asObservable();

  /** Trạng thái kết nối */
  public isConnected = new BehaviorSubject<boolean>(false);

  // ─── SignalR ─────────────────────────────────────────────

  startConnection(token: string): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.HUB_URL}?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (msg: ChatMessageDto) => {
      this.messageSubject.next(msg);
    });

    this.hubConnection.start()
      .then(() => this.isConnected.next(true))
      .catch(err => console.error('ChatHub error:', err));
  }

  sendMessage(receiverId: number, content: string, jobId?: number): void {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) return;
    this.hubConnection.invoke('SendMessage', { receiverId, content, jobId });
  }

  stopConnection(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
    this.isConnected.next(false);
  }

  // ─── REST ─────────────────────────────────────────────────

  getConversations(): Observable<ConversationDto[]> {
    return this.http.get<ConversationDto[]>(`${this.API}/conversations`);
  }

  getMessages(partnerId: number, jobId?: number): Observable<ChatMessageDto[]> {
    const params = jobId ? `?jobId=${jobId}` : '';
    return this.http.get<ChatMessageDto[]>(`${this.API}/messages/${partnerId}${params}`);
  }
}
