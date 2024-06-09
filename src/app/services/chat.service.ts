import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.localUrl + '/api/chat';

  constructor(private http: HttpClient) {}

  getMessages(userId1: number, userId2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages`, {
      params: {
        userId1: userId1.toString(),
        userId2: userId2.toString(),
      },
    });
  }

  getLastMessage(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/last-message`);
  }
}
