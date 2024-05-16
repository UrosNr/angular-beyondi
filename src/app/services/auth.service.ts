import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable, from, of, switchMap } from 'rxjs';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null | undefined> = new BehaviorSubject<User | null | undefined>(null);
  public currentUser$: Observable<User | null | undefined> = this.currentUserSubject.asObservable();
  private userService = inject(UserService);
  private afAuth = inject(AngularFireAuth);

  constructor() {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.userService.getUser(user.uid);
        } else {
          return of(null);
        }
      })
    ).subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }

  login(email: string, password: string) {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  logout() {
    return from(this.afAuth.signOut());
  }

  getAuthState() {
    return this.afAuth.authState;
  }

  getCurrentUser(): Observable<User | null | undefined> {
    return this.currentUser$;
  }
}
