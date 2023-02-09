import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import {
  NgcCookieConsentService,
  NgcStatusChangeEvent,
} from "ngx-cookieconsent";
import { Subscription } from "rxjs";
import { LoggerService } from "./services/logger.service";

/**
 * SWIM-UI root app component
 */
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "swim-ui";

  // keep refs to subscriptions to be able to unsubscribe later
  private statusChangeSubscription: Subscription;

  /**
   * Class constructor
   * @param authService authentication service
   */
  constructor(
    private authService: AuthService,
    private ccService: NgcCookieConsentService,
    private loggerService: LoggerService
  ) {}

  /**
   * Start authentication procedure when cookies are accepted by user
   */
  ngOnInit() {

    // console.log(this.ccService.hasConsented());
    if (this.ccService.hasConsented()) {
      this.authService.autoLogin();
    }

    // subscribe to cookie policy status changes
    this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
      (event: NgcStatusChangeEvent) => {
        if (event.status === "allow") {
          // start authorization session
          this.authService.autoLogin();
          // log consent in database setting a 1 second timeout to make sure auth token ready
          setTimeout(() => {
            const log = this.loggerService.LogEvent(
              3,
              6,
              "user agreed to allow cookies"
            );
            log.subscribe((response) => {});
          }, 1000);
        } else if (event.status === "deny") {
          // remove session cookies
          this.authService.removeCredentials();
          //localStorage.removeItem("cookieConsent");
        }
      }
    );
  }

  /**
   * Scroll to top of the page
   * @param event on routed
   */
  onActivate(event) {
    window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    // unsubscribe to cookieconsent observables to prevent memory leaks
    this.statusChangeSubscription.unsubscribe();
  }
}
