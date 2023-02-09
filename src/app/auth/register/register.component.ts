import { Component, OnInit } from '@angular/core';
import {
  NgForm,
  Validators,
  FormControl
} from '@angular/forms';
import { AuthService, AuthResponseData } from '../auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * User registration form component
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  /** Agreement flag */
  isAgreed = false;

  /** Hide text on password field  */
  hide = true;

  /** Hide text on confirm password field  */
  hideConfirmation = true;

  /** Flag if submit error happened */
  submitError = false;

  /** errorLog */
  private errorLog: any = null;

  /** Email field validation */
  email = new FormControl('', [Validators.required, Validators.email]);

  /**
   * Class constructor
   * @param authService authentication service
   * @param router router service
   */
  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  /**
   * Get backend error messages
   */
  getErrorMessage() {
    return this.errorLog;
  }

  /**
   * Component initialize
   */
  ngOnInit() {}

  /**
   * Submit registration form
   * @param form binded form
   */
  onSubmit(form: NgForm) {
    // clean the submit errors
    this.submitError = false;
    this.errorLog = '';

    // validate the form (required values)
    if (form.invalid) {
      this.errorLog = 'Incorrect form field values';
      this.submitError = true;
      return;
    }

    // validate the password confirmation
    if (form.value.password !== form.value.password2) {
      this.errorLog = 'Passwords do not match';
      this.submitError = true;
      return;
    }

    let authObs: Observable<any>;

    authObs = this.authService.signup(
      form.value.email,
      form.value.password,
      form.value.firstname,
      form.value.lastname,
      form.value.institution,
      form.value.department,
      form.value.role
    );
    authObs.subscribe(
      resData => {
        if (resData.message) {
          this.errorLog = resData.message;
          this.submitError = true;
          this.snackBar.open('Sign up Error', null, {
            duration: 3000,
          });
        } else {
        this.snackBar.open('Login Success!', null, {
          duration: 3000,
        });
        form.resetForm();
        this.router.navigate(['/home']);
        }
      },
      errorMessage => {
        this.errorLog = errorMessage;
        this.submitError = true;
        this.snackBar.open('Sign up Error', null, {
          duration: 4000,
        });
      }
    );
  }
}
