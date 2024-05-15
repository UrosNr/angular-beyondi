import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const passwordChangeGuard = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const firestore = inject(AngularFirestore);
  const router = inject(Router);
  const userService = inject(UserService);

  return authService.getAuthState().pipe(
    take(1),
    switchMap(user => {
      if (user) {
        return firestore.collection('users').doc(user.uid).valueChanges().pipe(
          take(1),
          map((userData: any) => {
            if (userData && !userData.passwordChanged) {
              router.navigate(['/change-password']);
              return false;
            }
            return true;
          })
        );
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};
