import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router, private socketSvc: SocketService) {}

  setUserId(userId: number): void {
    localStorage.setItem('currentUser', JSON.stringify(userId));
  }

  getUserId(): number | null {
    return localStorage.getItem('currentUser')
      ? +localStorage.getItem('currentUser')
      : null;
  }

  setReceiverId(receiverId: number): void {
    localStorage.setItem('receiver', JSON.stringify(receiverId));
  }

  getRecieverId(): number | null {
    return localStorage.getItem('receiver')
      ? +localStorage.getItem('receiver')
      : null;
  }

  // getOnlineUsers(): Observable<any> {
  //   return new Observable<any>((observer) => {
  //     this.socket.on('online-users', (users) => observer.next(users));
  //   });
  // }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.socketSvc.disconnect();
    this.router.navigate(['/login']);
  }
}
