import { Component, OnInit } from '@angular/core';
import {
  NgForm,
  Validators,
  FormControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { identifierModuleUrl } from '@angular/compiler';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  /** Hide text on current password field  */
  hideOld = true;

  /** Hide text on new password field  */
  hideNew = true;

  /** Hide text on confirm password field  */
  hideConfirmation = true;

  /** Flag if submit error happened */
  submitError = false;

  /** errorLog */
  private errorLog: any = null;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  /**
   * Get backend error messages
   */
  getErrorMessage() {
    return this.errorLog;
  }

  /**
   * Validate and submit password change form
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
    if (form.value.newPassword !== form.value.confirmPassword) {
      this.errorLog = 'Passwords do not match';
      this.submitError = true;
      return;
    }

    let changeObs: Observable<any>;

    changeObs = this.authService.changePassword(
      form.value.currentPassword,
      form.value.newPassword
    );

    changeObs.subscribe(
      response => {
        if (response) {
        this.snackBar.open(response.message, null, {
          duration: 5000,
        });
        form.resetForm();
        }
      }, (error) => {
        if (error.message) {
          console.log(error);
          this.errorLog = error.error.message;
          this.submitError = true;
          this.snackBar.open('An error occurred =(', null, {
            duration: 4000,
          });
        }
      });
  }

}
