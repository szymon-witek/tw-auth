// auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;
  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = authService.token;
            if (!newToken) {
              console.error('Token refresh failed. Logging out...');
              authService.logout();
              return throwError(() => error);
            }
            const retryRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            console.log('Retrying request with new token...');
            return next(retryRequest);
          }),
          catchError((err) => {
            console.error('Token refresh failed:', err);
            authService.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
