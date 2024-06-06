import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: number | null = null;
  private recevierId: number | null = null;

  constructor(private router: Router) {}

  setUserId(userId: number): void {
    this.userId = userId;
  }

  getUserId(): number | null {
    return this.userId;
  }

  setRecieverId(receiverId: number): void {
    this.recevierId = receiverId;
  }

  getRecieverId(): number | null {
    return this.recevierId;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
