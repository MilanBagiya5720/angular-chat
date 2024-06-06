import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private apiUrl = 'http://localhost:3005/api/chat'; // Change the port if your server is running on a different port

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:3005'); // Change the port if your server is running on a different port
  }

  joinRoom(senderId: number, receiverId: number) {
    this.socket.emit('joinRoom', { senderId, receiverId });
  }

  sendMessage(message: any) {
    this.socket.emit('sendMessage', message);
    // return this.http.post(`${this.apiUrl}/sendMessage`, message);
  }

  receiveMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (message) => {
        observer.next(message);
      });
    });
  }

  getMessages(userId1: number, userId2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages`, {
      params: {
        userId1: userId1.toString(),
        userId2: userId2.toString(),
      },
    });
  }
}
