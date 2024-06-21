import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.localUrl + '/api';

  constructor(private http: HttpClient) {}

  getMessages(userId1: number, userId2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat/messages`, {
      params: {
        userId1: userId1.toString(),
        userId2: userId2.toString(),
      },
    });
  }

  getMessageRequest(receiverId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/message-requests/requests/${receiverId}`
    );
  }

  getLastMessage(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/${userId}/last-message`);
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

  getGroupedMessages(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chat/group-messages/${userId}`);
  }

  getUnreadMessagesCount(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/unread-messages/${userId}`);
  }

  getUserStatus(userId: number, receiverId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/users/user-status?senderId=${userId}&receiverId=${receiverId}`
    );
  }
}
