import { Component, OnInit } from "@angular/core";
import { NgForm, FormControl, Validators } from "@angular/forms";
import { AuthService, AuthResponseData } from "./auth.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.css"],
})

/**
 * Component for authentication page
 */
export class AuthComponent implements OnInit {
  /** password field visibility */
  hide = true;
  /** user email from login form */
  email = new FormControl("", [Validators.required, Validators.email]);
  /** authentication error message */
  error: string = null;

  /**
   * Generate error message to display if email is not valid
   */
  getErrorMessage() {
    return this.email.hasError("required")
      ? "Invalid email format"
      : this.email.hasError("email")
      ? "Not a valid email"
      : "";
  }
  /**
   * Submits login information
   * @param form form containing user email and user password
   */
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    let authObs: Observable<AuthResponseData>;

    authObs = this.authService.login(email, password);
    authObs.subscribe(
      (resData) => {
        // console.log(resData);
        console.log("logged in as registered user...");
        this.openSnackBar("Login Success!", "");
        form.resetForm();
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.openSnackBar("Login Failed!", "");
        form.reset();
      }
    );
  }

  /**
   * Class Constructor
   * @param authService authentication service
   * @param router router mechanism
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}
  /**
   * Listener for register button.
   * Navigates to registration page
   */
  onRegisterClicked() {
    this.router.navigate(["/register"]);
  }

  private openSnackBar(message: string, action: string) {
    this.snackBar.open(message, null, {
      duration: 2500,
    });
  }
}
