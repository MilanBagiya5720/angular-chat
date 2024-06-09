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
  private apiUrl = environment.localUrl + '/api'; // Adjust the URL as necessary

  constructor(private http: HttpClient) {
    this.socket = io(environment.localUrl); // Adjust the URL as necessary
  }

  // Socket events
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on(event, (data) => observer.next(data));
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
    this.socket.emit('register-user-id', userId);
  }

  joinRoom(senderId: number, receiverId: number) {
    this.socket.emit('joinRoom', { senderId, receiverId });
  }

  sendMessage(message: any) {
    this.socket.emit('sendMessage', message);
  }

  sendMessageRequest(senderId: number, receiverId: number): void {
    this.socket.emit('send-message-request', {
      senderId,
      receiverId,
    });
  }

  respondMessageRequest(
    senderId: number,
    receiverId: number,
    accept: boolean
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond-message-request`, {
      senderId,
      receiverId,
      accept,
    });
  }

  getOnlineUsers(): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on('online-users', (users) => observer.next(users));
    });
  }

  markMessagesAsRead(senderId: number, receiverId: number): void {
    this.emit('mark-messages-read', { senderId, receiverId });
  }

  getMessages(senderId: number, receiverId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${senderId}/${receiverId}`);
  }

  getMessageRequestReceived(): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on('message-request-received', (data) => observer.next(data));
    });
  }

  receiveMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (message) => {
        observer.next(message);
      });
    });
  }
}
