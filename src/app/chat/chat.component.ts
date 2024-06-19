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
  messages: any[] = [];
  userId: number | null = null;
  receiverId: number | null = null;
  conversationId: number | null = null;
  unreadCount: number | null = null;

  groupedMessages: any[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.receiverId = this.authService.getRecieverId();

    this.registerUser();
    this.getUserMessage();
    this.joinChat();
    this.markAsRead();
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
      return;
    }
  }

  getUserMessage(): void {
    this.socketService.receiveMessage().subscribe((message) => {
      const lastMessage = this.groupedMessages.length ? this.groupedMessages[this.groupedMessages.length - 1] : null;
      if (lastMessage && lastMessage.timeGroup === message.timeGroup) {
        lastMessage.messages.push(message);
      } else {
        this.groupedMessages.push({
          timeGroup: message.timeGroup,
          messages: [message]
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
        isSeen: false,
        sender: 'self',
        receiver: 'receiver',
        type: 'text',
        videoThumbnail: 'videoThumbnail',
        messageCreatedAt: new Date(),
      };
      this.socketService.sendMessage(message);
      this.message = '';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  formatTime(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
