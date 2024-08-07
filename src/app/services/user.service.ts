import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.localUrl + '/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
