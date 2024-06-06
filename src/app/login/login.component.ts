// src/app/login/login.component.ts

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    this.http
      .post<any>('http://localhost:3005/api/users/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe(
        (response) => {
          if (response.auth && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.router.navigate(['/users']);
          } else {
            this.errorMessage = 'Invalid username or password';
          }
        },
        (error) => {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      );
  }
}
