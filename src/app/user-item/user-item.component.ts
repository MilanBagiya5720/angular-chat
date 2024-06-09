import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css'],
})
export class UserItemComponent {
  @Input() user: any;
  @Input() currentUserId: number;
  @Output() chatStarted = new EventEmitter<any>();
  @Output() requestSent = new EventEmitter<any>();

  startChat() {
    this.chatStarted.emit(this.user.id);
  }

  sendRequest() {
    this.requestSent.emit(this.user.id);
  }
}
