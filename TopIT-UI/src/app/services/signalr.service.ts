import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { NotificationService } from './notification';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;
  private notificationService = inject(NotificationService);

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7151/notificationHub', {
        withCredentials: true // Important for sending cookies/token if needed, though JWT is usually sent via Headers
      })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));

    this.addNotificationListener();
  }

  private addNotificationListener() {
    this.hubConnection?.on('ReceiveNotification', (message: string) => {
      // Show real-time notification to the user
      this.notificationService.success(message);
    });
  }

  public stopConnection() {
    this.hubConnection?.stop();
  }
}
