// src/app/register/register.component.ts

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    this.http
      .post<any>(environment.localUrl + '/api/users/register', {
        username: this.username,
        password: this.password,
      })
      .subscribe(
        (response) => {
          this.successMessage =
            'Registration successful! Redirecting to login...';
          this.errorMessage = '';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        (error) => {
          this.errorMessage =
            'An error occurred during registration. Please try again.';
          this.successMessage = '';
        }
      );
  }
}
