import { Component } from '@angular/core';
import { slideInAnimation } from './app-animations';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation]
})
export class AppComponent {
  title = 'TOH-英雄之旅';

  constructor(public authService: AuthService, private router:Router) {}

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.isLoggedIn = false;
    this.router.navigate(['']);
  }
}
