import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private apiUrl = environment.localUrl + '/api/chat'; // Change the port if your server is running on a different port

  constructor(private http: HttpClient) {
    this.socket = io(environment.localUrl); // Change the port if your server is running on a different port
  }

  joinRoom(senderId: number, receiverId: number) {
    this.socket.emit('joinRoom', { senderId, receiverId });
  }

  sendMessage(message: any) {
    this.socket.emit('sendMessage', message);
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
