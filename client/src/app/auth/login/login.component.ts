import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: [''],
      password: [''],
    });
  }

  login() {
    this.authService.login().subscribe(_ => {
      if (this.authService.isLoggedIn) {
        const redirectUrl = this.authService.redirectUrl
          ? this.router.parseUrl(this.authService.redirectUrl)
          : '/hero-list';
        this.router.navigateByUrl(redirectUrl);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
