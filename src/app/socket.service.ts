// src/app/services/socket.service.ts

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { fromEvent, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private apiUrl = 'http://localhost:3005/api'; // Adjust the URL as necessary

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3005'); // Adjust the URL as necessary
  }

  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return fromEvent(this.socket, event);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  connect(): void {
    this.socket.connect();
  }

  isConnected(): boolean {
    return this.socket.connected;
  }

  sendMessageRequest(senderId: number, receiverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-message-request`, {
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

  markMessagesAsRead(senderId: number, receiverId: number): void {
    this.emit('mark-messages-read', { senderId, receiverId });
  }

  getMessages(senderId: number, receiverId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${senderId}/${receiverId}`);
  }
}
