import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../socket.service';

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

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.socketSubscription = this.socketService
      .on('new-message')
      .subscribe((message: any) => {
        this.messages.push(message);
      });

    this.userId = this.authService.getUserId();
    if (this.userId && !this.socketService.isConnected()) {
      this.socketService.connect();
      this.socketService.emit('register-user-id', this.userId);
    }

    this.receiverId = this.authService.getRecieverId();
    if (this.userId === null) {
      this.router.navigate(['/login']);
      return;
    }

    this.chatService.receiveMessage().subscribe((message) => {
      this.messages.push(message);
    });

    this.joinChat();
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
}
