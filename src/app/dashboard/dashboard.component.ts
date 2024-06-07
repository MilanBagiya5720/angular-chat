import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  messageContent: string = '';
  users: any[] = [];
  currentUser: any;

  private socketSubscription: Subscription;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.currentUser = localStorage.getItem('currentUser');
  }

  ngOnInit(): void {
    this.loadUsers();

    const userId = this.currentUser.id;
    const receiverId = this.getReceiverId();

    this.socketService.getMessages(userId, receiverId).subscribe(
      (messages) => {
        this.messages = messages;
        this.markMessagesAsRead(userId, receiverId);
      },
      (error) => {
        console.error('Failed to load messages', error);
      }
    );

    this.socketSubscription = this.socketService
      .on('new-message')
      .subscribe((message: any) => {
        this.messages.push(message);
        this.markMessagesAsRead(userId, receiverId);
      });

    if (userId && !this.socketService.isConnected()) {
      this.socketService.connect();
      this.socketService.emit('register-user-id', userId);
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  sendMessage(): void {
    const message = {
      content: this.messageContent,
      senderId: this.currentUser.id,
      receiverId: this.getReceiverId(),
    };
    this.socketService.emit('send-message', message);
    this.messageContent = ''; // Clear the input field
  }

  private markMessagesAsRead(senderId: number, receiverId: number): void {
    this.socketService.markMessagesAsRead(senderId, receiverId);
  }

  private getReceiverId(): number | null {
    return this.authService.getRecieverId();
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: any) => {
        this.users = data.users;
      },
      (error) => {
        console.error('Failed to load users', error);
      }
    );
  }

  selectUser(user: any): void {
    this.authService.setReceiverId(user.id);
    console.log('User selected:', user);
  }

  logout(): void {
    this.authService.logout();
  }
}
