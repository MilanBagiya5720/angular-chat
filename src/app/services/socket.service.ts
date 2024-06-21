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

  updateUserStatus(): Observable<any> {
    return this.on<any>('update-user-status');
  }

  joinRoom(senderId: number, receiverId: number): void {
    this.emit('joinRoom', { senderId, receiverId });
  }

  sendMessage(message: any): void {
    this.emit('sendMessage', message);
  }

  receiveMessage(): Observable<any> {
    return this.on<any>('receiveMessage');
  }

  sendMessageRequest(senderId: number, receiverId: number): void {
    this.emit('send-message-request', {
      senderId,
      receiverId,
    });
  }

  receiveRequest(): Observable<any> {
    return this.on<any>('receive-message-request');
  }

  respondMessageRequest(
    senderId: number,
    receiverId: number,
    status: string
  ): void {
    this.emit('respond-message-request', { senderId, receiverId, status });
  }

  messageRequestResponse(): Observable<any> {
    return this.on<any>('message-request-response');
  }

  markMessagesAsRead(senderId: number, receiverId: number): void {
    this.emit('mark-messages-read', { senderId, receiverId });
  }

  clearChat(senderId: number, receiverId: number): void {
    this.emit('clear-messages', {
      senderId,
      receiverId,
    });
  }

  deleteMessage(senderId, receiverId, messageId): void {
    this.emit('delete-message', {
      senderId,
      receiverId,
      messageId,
    });
  }

  listenClearChat(): Observable<any> {
    return this.on<any>('listen-chat-clear');
  }

  listenDeleteMessage(): Observable<any> {
    return this.on<any>('listen-delete-message');
  }

  messagesRead(): Observable<any> {
    return this.on<any>('messages-read');
  }

  getUpdateMessagesCount(): Observable<any> {
    return this.on<any>('update-messages-count');
  }
}
