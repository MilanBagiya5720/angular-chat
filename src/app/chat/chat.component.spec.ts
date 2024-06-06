import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ChatComponent],
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'my-crud-app'`, () => {
    const fixture = TestBed.createComponent(ChatComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('my-crud-app');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'my-crud-app app is running!'
    );
  });
});
