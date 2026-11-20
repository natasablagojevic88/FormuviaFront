import { Component, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Session } from './services/session';
import { NotificationSocket } from './services/notification-socket';
import { Translate } from './services/translate';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FormuviaFront');

  readonly login = signal(true);

  constructor(
    public session: Session,
    public router: Router,
    private translate: Translate,
    // created here so it starts watching the session; it connects once the user is known
    private notificationSocket: NotificationSocket
  ){
    this.translate.load();

    this.session.load();

    this.router.events.subscribe((route)=>{
      if(route instanceof NavigationStart){
        this.login.set(route.url=='/login');
      }
    });
  }
}
