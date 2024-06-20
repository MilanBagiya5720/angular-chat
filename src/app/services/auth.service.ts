import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router, private socketSvc: SocketService) {}

  setUserDetails(user): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUserDetails(): any {
    return localStorage.getItem('currentUser')
      ? JSON.parse(localStorage.getItem('currentUser'))
      : null;
  }

  setUserId(userId: number): void {
    localStorage.setItem('userId', JSON.stringify(userId));
  }

  getUserId(): number | null {
    return localStorage.getItem('userId')
      ? +localStorage.getItem('userId')
      : null;
  }

  setReceiverId(receiverId: number): void {
    localStorage.setItem('receiver', JSON.stringify(receiverId));
  }

  getReceiverId(): number | null {
    return localStorage.getItem('receiver')
      ? +localStorage.getItem('receiver')
      : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.socketSvc.disconnect();
    this.router.navigate(['/login']);
  }
}
