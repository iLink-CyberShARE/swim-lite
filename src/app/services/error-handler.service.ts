import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError} from 'rxjs';
import { LoggerService } from './logger.service';

/**
 * Error Handler Service
 */
@Injectable({
  providedIn: 'root'
})

export class ErrorHandlerService {

  constructor(private router: Router, private logger: LoggerService) {}

  /**
   * Handle general http response errors
   * @param response error response onject from the server
   */
  public handleHttpError(response: HttpErrorResponse) {
    switch (response.status) {
      case 401: // not authorized
        this.router.navigate(['/unauthorized-page', response.message]);
        break;
      case 404: // records not found
        this.router.navigate(['/norecords-page', response.message]);
        break;
      default:
        this.router.navigate(['/error-page', response.message]);
    }
  }

  /**
   * Handle an error message directly
   * @param message message to display on error
   */
  public handleMessageError(message: String){
    this.router.navigate(['/error-page', message]);
  }

  /**
   * Handles user authentication response errors from the server
   * @param response error response object from the server
   */
  public handleAuthError(response: HttpErrorResponse) {
    let errorMessage = 'An error ocurred, try again later';
    // if there is a sequalize error
    if (response.error.message.errors) {
      return throwError(response.error.message.errors[0].message);
    }
    // a direct error message handled in backend
    if (!response.error || !response.error.error) {
      return throwError(errorMessage);
    }
    switch (response.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists';
        break;
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_PASSWORD':
        errorMessage = 'Email or password is incorrect';
        break;
    }
    return throwError(errorMessage);
  }

  /**
   * Handles errors derived from try catch blocks.
   */
  public handleAngularError(error: any) {
    this.logger.LogEvent(5, 4, error);
  }

}
