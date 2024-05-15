import { inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const firestore = inject(AngularFirestore);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const userService = inject(UserService);

  return authService.getAuthState().pipe(
    take(1),
    switchMap(user => {
      if (user) {
        return firestore.collection('users').doc(user.uid).valueChanges().pipe(
          take(1),
          map((userData: any) => {
            if (userData && userData.isAdmin) {
              return true;
            }
            toastr.warning('You are not allowed to access this route.');
            router.navigate(['/']);
            return false;
          })
        );
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};
