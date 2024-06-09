import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  message = '';
  messages: any[] = [];
  userId: number | null = null;
  receiverId: number | null = null;

  private socketSubscription: Subscription;
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.receiverId = this.authService.getRecieverId();

    if (this.userId && !this.socketService.isConnected()) {
      this.socketService.connect();
      this.socketService.emit('register-user-id', this.userId);
    }

    if (this.userId === null) {
      this.router.navigate(['/login']);
      return;
    }

    this.chatService.receiveMessage().subscribe((message) => {
      this.messages.push(message);
    });

    this.joinChat();
  }

  getUserAvatar(userId: number): string {
    if (userId === this.userId) {
      return '/assets/self.jpg';
    } else {
      return `/assets/avtar.jpg`;
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  joinChat(): void {
    if (this.receiverId !== null) {
      this.chatService.joinRoom(this.userId!, this.receiverId);
      this.chatService
        .getMessages(this.userId!, this.receiverId)
        .subscribe((messages) => {
          this.messages = messages;
        });
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
      };
      this.chatService.sendMessage(message);
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
