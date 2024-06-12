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
  userId: number;
  users: any[] = [];
  messageRequests: any[] = [];
  onlineUsersSubscription: Subscription;

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
      error: (error: any) => {
        console.error('Failed to load users', error);
      },
    });
  }

  getUserStatus(): void {
    this.onlineUsersSubscription = this.socketService
      .updateUserStatus()
      .subscribe({
        next: (data: any) => {
          const user = this.users.find((u) => u.id === data.userId);
          if (user) {
            user.isOnline = data.isOnline;
          }
        },
        error: (error: any) => {
          console.error('Failed to update user status', error);
        },
      });

    if (this.userId) {
      this.socketService.registerUserId(this.userId);
    }
  }

  startChat(receiverId: number): void {
    this.authService.setReceiverId(receiverId);
    this.router.navigateByUrl('/chat');
  }

  sendMessageRequest(receiver: any): void {
    const message = "Hello, I'd like to chat!";
    this.socketService.sendMessageRequest(
      this.userId,
      receiver.id,
      message,
      receiver.senderName
    );
  }

  getMessageRequest(): void {
    this.socketService.receiveRequest().subscribe({
      next: (data: any) => {
        const { senderId, message, senderName } = data;
        const user = this.users.find((u) => u.id === senderId);
        if (user) {
          user.lastMessage = message;
          this.messageRequests.push({
            senderId,
            senderName: senderName,
            lastMessage: message,
          });
          alert(`Message request from ${user.username}: ${message}`);
        }
      },
      error: (error: any) => {
        console.error('Failed to receive message request', error);
      },
    });

    this.chatService.getMessageRequest(this.userId).subscribe({
      next: (data: any) => {
        this.messageRequests = data.messagesReq;
      },
      error: (error: any) => {
        console.error('Failed to load message requests', error);
      },
    });

    this.socketService.messageRequestResponse().subscribe({
      next: (data: any) => {
        debugger;
        const { receiverId, status } = data;
        const user = this.users.find((u) => u.id === receiverId);
        if (user) {
          user.status = status;
        }
      },
      error: (error: any) => {
        console.error('Failed to handle message request response', error);
      },
    });
  }

  getUserById(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (data: any) => {
        return data.username;
      },
      error: (error: any) => {
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
    this.socketService.disconnect();
  }
}
