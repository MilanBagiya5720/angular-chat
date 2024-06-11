import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: any[] = [];
  userId: number | null = null;
  messageRequests: any[] = [];

  private onlineUsersSubscription: Subscription = new Subscription();
  private messageRequestSubscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router
  ) {
    this.userId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.getUsersList();
    this.getUserStatus();
    this.getMessageRequest();
  }

  getUsersList(): void {
    this.userService.getAllUsers(this.userId).subscribe({
      next: (data: any) => {
        this.users = data.users;
      },
      error: (error) => {
        console.error('Failed to load users', error);
      },
    });
  }

  getUserStatus(): void {
    this.onlineUsersSubscription = this.socketService
      .updateUserStatus()
      .subscribe((data: any) => {
        const user = this.users.find((u) => u.id === data.userId);
        if (user) {
          user.isOnline = data.isOnline;
        }
      });

    if (this.userId) {
      this.socketService.registerUserId(this.userId);
    }
  }

  startChat(receiverId: any): void {
    this.authService.setReceiverId(receiverId.id);
    this.router.navigateByUrl('/chat');
  }

  sendMessageRequest(receiver: any): void {
    const message = "Hello, I'd like to chat!";
    this.socketService.sendMessageRequest(this.userId, receiver.id, message);
  }

  getMessageRequest(): void {
    this.messageRequestSubscription = this.socketService
      .receiveRequest()
      .subscribe((data: any) => {
        const { senderId, message } = data;
        const user = this.users.find((u) => u.id === senderId);
        if (user) {
          user.lastMessage = message;
          this.messageRequests.push({
            senderId,
            senderUsername: user.username,
            lastMessage: message,
          });
        }
        alert(`Message request from ${user.username}: ${message}`);
      });

    this.chatService.getMessageRequest(this.userId).subscribe((data: any) => {
      this.messageRequests = data.messagesReq;
    });

    this.socketService.messageRequestResponse().subscribe((data: any) => {
      const { receiverId, status } = data;
      const user = this.users.find((u) => u.id === receiverId);
      if (user) {
        user.status = status;
      }
    });
  }

  getUserById(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (data: any) => {
        return data.username;
      },
      error: (error) => {
        console.error('Failed to load user', error);
      },
    });
  }

  respondMessageRequest(senderId: number, status: string): void {
    this.socketService.respondMessageRequest(senderId, this.userId, status);
    this.messageRequests = this.messageRequests.filter(
      (request) => request.senderId !== senderId
    );

    const user = this.users.find((u) => u.id === senderId);
    if (user) {
      user.status = status;
    }
  }

  ngOnDestroy(): void {
    if (this.onlineUsersSubscription) {
      this.onlineUsersSubscription.unsubscribe();
    }

    if (this.messageRequestSubscription) {
      this.messageRequestSubscription.unsubscribe();
    }
    this.socketService.disconnect();
  }
}
