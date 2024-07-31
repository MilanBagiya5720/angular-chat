import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from '../services/chat.service';
import { ToasterService } from '../services/toaster.service';

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
  totalUnreadMessageCount: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router,
    private toast: ToasterService
  ) {
    this.userId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupSocketListeners();
  }

  private initializeData(): void {
    this.getUsersList();
    this.getUserStatus();
    this.getUnreadCount();
  }

  private setupSocketListeners(): void {
    this.socketService.getUpdateMessagesCount().subscribe(
      () => {
        this.getUnreadCount();
        this.updateLastMessages();
        this.getUsersList();
      },
      (error) => {
        this.handleError('Failed to get update messages count', error);
      }
    );
  }

  private updateLastMessages(): void {
    this.chatService.getLastMessage(this.userId).subscribe(
      (response) => {
        if (response && response.length > 0) {
          this.users.forEach((user) => {
            const lastMessage = response.find(
              (msg) => msg.senderId === user.id
            );
            if (lastMessage) {
              user.last_message = lastMessage.text;
            }
          });
        }
      },
      (error) => {
        this.handleError('Failed to get last message', error);
      }
    );
  }

  private handleError(message: string, error: any): void {
    this.toast.error(message, '');
    console.error(message, error);
  }

  private getUnreadCount(): void {
    this.chatService.getUnreadMessagesCount(this.userId!).subscribe(
      (response) => {
        this.totalUnreadMessageCount = response.unreadCount;
      },
      (error) => {
        this.toast.error('Failed to get unread messages count', '');
        console.error('Failed to get unread messages count', error);
      }
    );

    this.socketService.messagesRead().subscribe(
      (data) => {
        this.getUnreadCount();
      },
      (error) => {
        this.toast.error('Failed to get messages read', '');
        console.error('Failed to get messages read', error);
      }
    );
  }

  private getUsersList(): void {
    this.userService.getAllUsers(this.userId).subscribe({
      next: (data: any) => {
        this.users = data.users;
      },
      error: (error: any) => {
        console.error('Failed to load users', error);
      },
    });
  }

  private getUserStatus(): void {
    this.onlineUsersSubscription = this.socketService
      .updateUserStatus()
      .subscribe(
        (data: any) => this.updateUserStatus(data),
        (error: any) => this.handleError('Failed to update user status', error)
      );

    if (this.userId) {
      this.socketService.registerUserId(this.userId);
    }
  }

  private updateUserStatus(data: any): void {
    const user = this.users.find((u) => u.id === data.userId);
    if (user) {
      user.is_online = data.is_online;
    }
  }

  public sendMessageRequest(receiver: any): void {
    this.socketService.sendMessageRequest(this.userId, receiver.id);
  }

  public startChat(user: any): void {
    this.authService.setReceiverId(user.id);
    this.authService.setReceiver(user);
    this.router.navigateByUrl('/chat');
  }

  // private getMessageRequest(): void {
  //   this.socketService.receiveRequest().subscribe(
  //     ({ senderId, message, senderName }: any) => {
  //       const user = this.users.find((u) => u.id === senderId);
  //       if (user) {
  //         user.lastMessage = message;
  //         this.messageRequests.push({
  //           senderId,
  //           senderName,
  //           lastMessage: message,
  //         });

  //         this.toast.success(`Message request from ${user.name}`, message);
  //       }
  //     },
  //     (error) => {
  //       this.toast.error('Failed to receive message request', '');
  //       console.error('Failed to receive message request', error);
  //     }
  //   );

  //   this.chatService.getMessageRequest(this.userId).subscribe(
  //     ({ messagesReq }: any) => {
  //       this.messageRequests = messagesReq;
  //     },
  //     (error) => {
  //       this.toast.error('Failed to load message requests', '');
  //       console.error('Failed to load message requests', error);
  //     }
  //   );

  //   this.socketService.messageRequestResponse().subscribe(
  //     ({ receiverId, status }: any) => {
  //       const user = this.users.find((u) => u.id === receiverId);
  //       if (user) {
  //         user.status = status;
  //       }
  //     },
  //     (error) => {
  //       console.error('Failed to handle message request response', error);
  //     }
  //   );
  // }

  ngOnDestroy(): void {
    if (this.onlineUsersSubscription) {
      this.onlineUsersSubscription.unsubscribe();
    }
    this.socketService.disconnect();
  }
}
