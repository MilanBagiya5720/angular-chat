import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { Subscription, fromEvent } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-userList',
  templateUrl: './userList.component.html',
  styleUrls: ['./userList.component.css'],
})
export class UserListComponent {
  users: any[] = [];
  private socketSubscription: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(
      (data: any) => {
        this.users = data.users;
      },
      (error) => {
        console.error('Failed to load users', error);
      }
    );

    this.socketSubscription = this.socketService
      .on('update-user-status')
      .subscribe((data: any) => {
        const user = this.users.find((u) => u.id === data.userId);
        if (user) {
          user.isOnline = data.isOnline;
        }
      });

    // Register the user ID with the socket connection
    const userId = this.authService.getUserId();
    if (userId) {
      this.socketService.emit('register-user-id', userId);
    }
  }

  startChat(receiverId: number): void {
    debugger
    this.authService.setRecieverId(receiverId);
    this.router.navigateByUrl('/chat');
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  sendMessageRequest(receiverId: number): void {
    const senderId = this.authService.getUserId();
    this.socketService.emit('send-message-request', { senderId, receiverId });
  }
}
