import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.getAuthState().pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return from(user.getIdToken()).pipe(
            switchMap(token => {
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next.handle(clonedRequest);
            }),
            catchError((error: HttpErrorResponse) => this.handleError(error))
          );
        } else {
          return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error))
          );
        }
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401 || error.status === 403) {
      // Handle unauthorized errors
      return throwError(() => new Error('Unauthorized access'));
    }
    return throwError(() => error);
  }
}
