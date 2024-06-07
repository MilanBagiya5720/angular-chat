import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
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
    this.authService.setReceiverId(receiverId);
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
