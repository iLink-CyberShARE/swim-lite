import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { take, exhaustMap } from 'rxjs/operators';
/**
 * Service to intercept authentication requests
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  /**
   * Class constructor
   * @param authService authentication service
   */
  constructor(private authService: AuthService) {}
  /**
   * Intercepts and handles authentication requests
   * @param req http request
   * @param next http handler
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {

    let token = '';
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        if (!user) {
          return next.handle(req);
        }
        if (user.token) {
           token = user.token.split(' ')[1];
        } else {
          const userData: {
            email: string;
            _token: string;
            _id: number;
            _tokenExpirationDate: string;
          } = JSON.parse(localStorage.getItem('guestData'));
          token = userData._token.split(' ')[1];
        }

        const modifiedReq = req.clone({
          headers: req.headers.append("Authorization",
              "Bearer " + token
              )
      });
        // console.log(modifiedReq);
        return next.handle(modifiedReq);
      })
    );
  }
}
