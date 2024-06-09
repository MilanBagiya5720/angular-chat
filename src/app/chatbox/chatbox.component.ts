import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css'],
})
export class ChatBoxComponent implements OnInit, OnDestroy {
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

    this.socketService.receiveMessage().subscribe((message) => {
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
      this.socketService.joinRoom(this.userId!, this.receiverId);
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
      this.socketService.sendMessage(message);
      this.message = '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
