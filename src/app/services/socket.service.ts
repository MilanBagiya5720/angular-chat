import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private apiUrl = `${environment.localUrl}/api`;

  constructor(private http: HttpClient) {
    this.socket = io(environment.localUrl);
  }

  // Socket events
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>((observer) => {
      this.socket.on(event, (data: T) => observer.next(data));
    });
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  registerUserId(userId: number): void {
    this.emit('register-user-id', userId);
  }

  joinRoom(senderId: number, receiverId: number): void {
    this.emit('joinRoom', { senderId, receiverId });
  }

  sendMessage(message: any): void {
    this.emit('sendMessage', message);
  }

  getOnlineUsers(): Observable<any> {
    return this.on<any>('online-users');
  }

  receiveMessage(): Observable<any> {
    return this.on<any>('receiveMessage');
  }

  sendMessageRequest(
    senderId: number,
    receiverId: number,
    message: string
  ): void {
    this.emit('send-message-request', { senderId, receiverId, message });
  }

  receiveRequest(): Observable<any> {
    return this.on<any>('receive-message-request');
  }

  respondMessageRequest(
    senderId: number,
    receiverId: number,
    accept: boolean
  ): void {
    this.emit('respond-message-request', { senderId, receiverId, accept });
  }

  markMessagesAsRead(senderId: number, receiverId: number): void {
    this.emit('mark-messages-read', { senderId, receiverId });
  }

  getUnreadMessagesCount(userId: number, receiverId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/chat/unread-messages/${userId}/${receiverId}`
    );
  }
}
