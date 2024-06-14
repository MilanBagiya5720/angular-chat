// src/app/login/login.component.ts

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  name: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    this.http
      .post<any>(environment.localUrl + '/api/users/login', {
        name: this.name,
        password: this.password,
      })
      .subscribe(
        (response) => {
          if (response.auth && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            this.authService.setUserId(response.user.id);
            this.router.navigate(['/users']);
          } else {
            this.errorMessage = 'Invalid name or password';
          }
        },
        (error) => {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      );
  }
}
