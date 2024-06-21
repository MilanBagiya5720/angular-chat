import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  message = '';
  userId: number | null = null;
  receiverId: number | null = null;
  receiver: any;

  groupedMessages: any[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.receiverId = this.authService.getReceiverId();
    this.receiver = this.authService.getReceiver();

    this.registerUser();
    this.getUserMessage();
    this.joinChat();
    this.markAsRead();
    this.listenClearChat();
    this.listenDeleteMessage();
    this.getMessageRequest();

    this.getUserStatus();
  }

  getUserStatus(): void {
    this.chatService
      .getUserStatus(this.userId, this.receiverId)
      .subscribe((status) => {
      });
  }

  markAsRead(): void {
    this.socketService.markMessagesAsRead(this.userId!, this.receiverId!);
  }

  registerUser(): void {
    if (this.userId && !this.socketService.isConnected()) {
      this.socketService.connect();
      this.socketService.emit('register-user-id', this.userId);
    }

    if (this.userId === null) {
      this.router.navigate(['/login']);
    }
  }

  getUserMessage(): void {
    this.socketService.receiveMessage().subscribe((message) => {
      const lastMessage = this.groupedMessages.length
        ? this.groupedMessages[this.groupedMessages.length - 1]
        : null;
      if (lastMessage && lastMessage.timeGroup === message.timeGroup) {
        lastMessage.messages.push(message);
      } else {
        this.groupedMessages.push({
          timeGroup: message.timeGroup,
          messages: [message],
        });
      }
    });
  }

  joinChat(): void {
    if (this.receiverId !== null) {
      this.socketService.joinRoom(this.userId!, this.receiverId);
      this.chatService
        .getMessages(this.userId!, this.receiverId)
        .subscribe((messages) => {
          this.groupedMessages = messages;
        });
    }
  }

  getUserAvatar(userId: number): string {
    if (userId === this.userId) {
      return '/assets/self.jpg';
    } else {
      return `/assets/avtar.jpg`;
    }
  }

  sendMessage(): void {
    if (
      this.message.trim() &&
      this.userId !== null &&
      this.receiverId !== null
    ) {
      const message = {
        senderId: this.userId,
        receiverId: this.receiverId,
        text: this.message,
        sender: 'self',
        receiver: 'receiver',
        isSeen: 0,
        type: 'text',
        videoThumbnail: 'videoThumbnail',
        messageCreatedAt: new Date(),
      };
      this.socketService.sendMessage(message);
      this.message = '';
    }

    if (this.receiver.status === 'not sent') {
      this.sendMessageRequest();
    }
  }

  public sendMessageRequest(): void {
    this.socketService.sendMessageRequest(this.userId, this.receiverId);
  }

  clearChat(): void {
    this.socketService.clearChat(this.userId, this.receiverId);
  }

  deleteMessage(messageId: number): void {
    this.socketService.deleteMessage(this.userId, this.receiverId, messageId);
  }

  listenClearChat(): void {
    this.socketService.listenClearChat().subscribe(() => {
      this.groupedMessages = [];
    });
  }

  listenDeleteMessage(): void {
    this.socketService.listenDeleteMessage().subscribe((messageId) => {
      this.groupedMessages = this.groupedMessages.map((group) => ({
        ...group,
        messages: group.messages.filter(
          (message) => message.messageId !== messageId
        ),
      }));
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatTime(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  respondMessageRequest(status: string): void {
    this.socketService.respondMessageRequest(
      this.receiverId,
      this.userId,
      status
    );
  }

  private getMessageRequest(): void {
    this.socketService.receiveRequest().subscribe(
      ({ senderId, message, senderName }: any) => {
        debugger;
        // const user = this.users.find((u) => u.id === senderId);
        // if (user) {
        //   user.lastMessage = message;
        //   this.messageRequests.push({
        //     senderId,
        //     senderName,
        //     lastMessage: message,
        //   });

        //   this.toast.success(`Message request from ${user.name}`, message);
        // }
      },
      (error) => {
        // this.toast.error('Failed to receive message request', '');
        console.error('Failed to receive message request', error);
      }
    );

    this.socketService.messageRequestResponse().subscribe(
      ({ receiverId, status }: any) => {
        debugger;
        // // const user = this.users.find((u) => u.id === receiverId);
        // if (user) {
        //   user.status = status;
        // }
      },
      (error) => {
        console.error('Failed to handle message request response', error);
      }
    );
  }
}
