import { Component, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Session } from './services/session';
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
    private translate: Translate
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
