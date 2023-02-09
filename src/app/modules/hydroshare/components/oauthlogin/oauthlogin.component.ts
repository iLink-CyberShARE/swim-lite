import { Component, OnInit } from "@angular/core";
import { HydroShareService } from "../../hydroshare.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { HSUser } from "../../models/hsuser.model";

@Component({
  selector: "app-oauthlogin",
  templateUrl: "./oauthlogin.component.html",
  styleUrls: ["../../styles/style.css"],
})

/**
 * Sign-in to Hydroshare with OAuth 2.0 Authentication
 */
export class OauthloginComponent implements OnInit {
  constructor(
    private _hydroshareService: HydroShareService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  /* login endpoint */
  loginEndpoint = this._hydroshareService.getSWIMHSLOGINURL();

  /** flags */
  isError = false;
  errorMessage = "";
  isSignedIn = false;
  isValidating = false;


  ngOnInit() {
    this._route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("token") && paramMap.has("exp")) {
        this.isValidating = true;
        let exp: number = +paramMap.get("exp");
        this.onTokenReceived(paramMap.get("token"), exp);
      }
    });
  }

  onTokenReceived(token: string, exp: number) {
    let authObs: Observable<HSUser>;
    authObs = this._hydroshareService.startHSessionToken(token, exp);
    authObs.subscribe(
      (response) => {
        if (response.id) {
          this.isValidating = false;
          this.isSignedIn = true;
          // console.log(response); //debug
          console.log("HS user is valid.");
          setTimeout(() => {
            this._router.navigate(["private"]);
          }, 3500);
          return;
        }
        this.isValidating = false;
        this.errorMessage = "Invalid access token";
        this.isError = true;
        return;
      },
      (errorMessage) => {
        this.isValidating = false;
        this.errorMessage = errorMessage.error.detail;
        this.isError = true;
        return;
      }
    );
  }
}
