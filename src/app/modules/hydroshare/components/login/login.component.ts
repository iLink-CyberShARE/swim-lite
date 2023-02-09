import { Component, OnInit } from "@angular/core";
import { NgForm, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { HydroShareService } from "../../hydroshare.service";
import { HSUser } from "../../models/hsuser.model";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../styles/style.css"],
})

/**
 * Signin to Hydroshare with Basic Authentication
 */
export class LoginComponent implements OnInit {
  constructor(
    private _hydroshareService: HydroShareService,
    private _router: Router
  ) {}

  /** flags */
  isError = false;
  errorMessage = "";
  isSignedIn = false;
  isAgreementChecked = false;

  ngOnInit(): void {}

  onSubmit(form: NgForm) {
    console.log("Starting HS session...");

    // clear any previous errors
    this.isError = false;
    this.errorMessage = "";

    if (!form.valid) {
      console.log("Invalid form");
      this.isError = true;
      this.errorMessage = "Form is Invalid";
      return;
    }

    const hsuser = form.value.hsuser;
    const password = form.value.password;
    let authObs: Observable<HSUser>;

    authObs = this._hydroshareService.startHSSession(hsuser, password);
    authObs.subscribe(
      (response) => {
        this.isSignedIn = true;
        console.log(response); //debug
        console.log("HS user is valid.");
        form.resetForm();
        setTimeout(() => {
          this._router.navigate(['private']);
        }, 3500);
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.errorMessage = errorMessage.error.detail;
        this.isError = true;
        form.reset();
        return;
      }
    );
  }
}
