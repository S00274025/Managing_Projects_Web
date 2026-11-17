import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';


function serverMessage(error: HttpErrorResponse): string | null {
  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }
  return null;
}


export function friendlyMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Cannot reach the server. Check that the API is running.';
    case 400:
      return 'Some of the data was not valid.';
    case 401:
      return serverMessage(error) ?? 'Please log in to continue.';
    case 403:
      return 'You are not allowed to do that.';
    case 404:
      return 'The item you asked for could not be found.';
    case 409:
      return serverMessage(error) ?? 'That item already exists.';
    default:
      return 'Something went wrong on the server. Please try again later.';
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`HTTP ${error.status} ${req.method} ${req.url}`, error);
      
      if (error.status === 401 && !req.url.includes('/auth/login') && auth.isLoggedIn()) {
        auth.logout();
      }
      return throwError(() => new Error(friendlyMessage(error)));
    }),
  );
};
