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

  private onlineUsersSubscription: Subscription;
  messages;

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
    this.loadMessages();
    this.getUnreadMessagesCountAllUsers(this.userId, 26);
  }

  loadMessages(): void {
    this.chatService.getGroupedMessages(this.userId).subscribe(
      (data) => {
        this.messages = data;
      },
      (error) => {
        console.error('Error fetching messages', error);
      }
    );
  }

  keys(obj: any): Array<string> {
    return obj ? Object.keys(obj) : [];
  }

  getUnreadMessagesCountAllUsers(userId, receiverId): void {
    this.socketService
      .getUnreadMessagesCount(userId, receiverId)
      .subscribe(({ unreadCount }) => {
        this.users.forEach((user) => {
          user.unreadMessageCount = unreadCount;
        });
      });
  }

  getMessageRequest(): void {
    this.socketService.receiveRequest().subscribe((data: any) => {
      this.messageRequests.push(data);
    });

    this.chatService.getMessageRequest(this.userId).subscribe((data: any) => {
      this.messageRequests = data.messagesReq;
    });
  }

  getUsersList(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.users;
      },
      error: (error) => {
        console.error('Failed to load users', error);
      },
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

  getUserStatus(): void {
    this.onlineUsersSubscription = this.socketService
      .on('update-user-status')
      .subscribe((data: any) => {
        const user = this.users.find((u) => u.id === data.userId);
        if (user) {
          user.isOnline = data.isOnline;
        }
      });

    if (this.userId) {
      this.socketService.emit('register-user-id', this.userId);
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

  respondMessageRequest(senderId: number, status: boolean): void {
    this.socketService.respondMessageRequest(senderId, this.userId, status);
    this.messageRequests = this.messageRequests.filter(
      (request) => request.senderId !== senderId
    );
  }

  ngOnDestroy(): void {
    if (this.onlineUsersSubscription) {
      this.onlineUsersSubscription.unsubscribe();
    }

    this.socketService.disconnect();
  }
}
