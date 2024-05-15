import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getAuthState().pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: router.url, reason: 'unauthorized' } });
        return false;
      }
    })
  );
};
