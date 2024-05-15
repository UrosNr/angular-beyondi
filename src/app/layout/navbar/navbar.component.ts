import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  userIsLoggedIn: boolean = false;
  user: User |null| undefined = undefined;
  private authSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.authSubscription = this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.userIsLoggedIn = true;
        this.userSubscription = this.authService.getUser().subscribe(user => {
          console.log(user);
          this.user = user;
        });
      } else {
        this.userIsLoggedIn = false;
        this.user = undefined;
        this.unsubscribeUser();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAuth();
    this.unsubscribeUser();
  }

  logout(): void {
    this.authService.logout();
      this.userIsLoggedIn = false;
      this.user = undefined;
      this.router.navigate(['/login']);
  }

  private unsubscribeAuth(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private unsubscribeUser(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  editAdmin(): void {
    if(this.user)
    this.router.navigate(['/admin-details', this.user.uid]);
  }
}
