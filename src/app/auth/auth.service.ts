import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpBackend,
} from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, BehaviorSubject, Observable } from "rxjs";
import { User } from "./user.model";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";

/**
 * SWIM API URL
 */
const SWIM_AUTH_API = environment.nodeServer + "/swim-auth-api";

/**
 * Data model for authentication response
 */
export interface AuthResponseData {
  /** token id */
  idToken: string;
  /** user email */
  email: string;
  /** expiration timer */
  expiresIn: string;
  /** authentication status */
  success?: boolean;
  /** User ID */
  id: number;
  /** User role */
  role?: string;
  /** is content manager */
  cont?: boolean;
}

/**
 * Service for user authentication on the SWIM platform
 */
@Injectable()
export class AuthService {
  /** Monitor changes in user information */
  user = new BehaviorSubject<User>(null);
  /** Token expiration timer */
  private tokenExpirationTimer: any;

  /**
   * Class contructor
   * @param http http service
   * @param http2 http service 2
   * @param router
   * @param handler
   */
  constructor(
    private http: HttpClient,
    private http2: HttpClient,
    private router: Router,
    handler: HttpBackend
  ) {
    this.http = new HttpClient(handler);
  }

  /**
   * Self registration form for SWIM
   * @param email user email
   * @param password  user password
   * @param firstname first name
   * @param lastname lastname/surname
   * @param institution affiliated institution
   * @param department department affiliated to the institution
   * @param role user role
   */
  signup(
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    institution?: string,
    department?: string,
    role?: string
  ) {
    return this.http
      .post<AuthResponseData>(SWIM_AUTH_API + "/signup", {
        email,
        password,
        firstname,
        lastname,
        institution,
        department,
        role,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.idToken,
            +resData.expiresIn,
            +resData.id,
            false
          );
        })
      );
  }

  /**
   * On submit login
   * Dev endpoint: http://localhost:3000/api/authenticate
   * @param email user email
   * @param password user password
   */
  login(email: string, password: string) {
    console.log('Logging in...');
    // remove hsauth if there
    localStorage.removeItem("HSAuth");
    return this.http
      .post<AuthResponseData>(SWIM_AUTH_API + "/authenticate", {
        email,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.idToken,
            +resData.expiresIn,
            +resData.id,
            false,
            resData.role,
            resData.cont
          );
        })
      );
  }

  /**
   * On submit login
   * Dev endpoint: http://localhost:3000/api/authenticate
   * @param email user email
   * @param password user password
   */
  guestLogin(isGuest: boolean) {
    // console.log('Logging in...');
    return this.http
      .post<AuthResponseData>(SWIM_AUTH_API + "/authenticateGuest", {
        isGuest,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.email,
            resData.idToken,
            +resData.expiresIn,
            +resData.id,
            isGuest,
            resData.role,
            resData.cont
          );
        })
      );
  }

  /**
   * Logout from the system but leaves guest account open
   */
  logout() {
    this.user.next(null);
    localStorage.removeItem("userData");
    this.tokenExpirationTimer = null;
    this.guest();
  }

  /**
   * Remove user credentials without auto guest login
   */
  removeCredentials() {
    this.user.next(null);
    localStorage.removeItem("userData");
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  /**
   * Auto login guest user
   *
   */
  guest() {
    let authObs: Observable<AuthResponseData>;
    authObs = this.guestLogin(true);
    authObs.subscribe(
      (resData) => {
        // console.log(resData);
        // console.log('logged in as guest...');
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );
  }

  /**
   * renew login
   */
  autoLogin() {
    // console.log('autologin');
    const userData: {
      email: string;
      _token: string;
      _id: number;
      _tokenExpirationDate: string;
      isGuest: boolean;
    } = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      localStorage.removeItem("HSAuth"); //test
      return this.guest();
    }
    this.user.next(null);
    const loadedUser = new User(
      userData.email,
      userData._token,
      new Date(userData._tokenExpirationDate),
      userData._id,
      userData.isGuest
    );
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    } else {
      return this.guest();
    }
  }

  /**
   * Logout when token expires
   * @param expirationDuration time to expire
   */
  autoLogout(expirationDuration: number) {
    // console.log(expirationDuration);
    // expirationDuration = 6000; // for testing only
    this.tokenExpirationTimer = setTimeout(() => {
      // console.log('token renew...');
      console.log("Session expired...");
      let userData = JSON.parse(localStorage.getItem("userData"));
      let isGuest = userData.isGuest;
      // alert session expired if logged in with account after exp timeout
      if (this.tokenExpirationTimer && !isGuest) {
        alert("Your session has expired please login again.");
        clearTimeout(this.tokenExpirationTimer);
        // Redirect to home page
        this.router.navigate(["/"]);
      }

      this.logout();
    }, expirationDuration);
  }

  /**
   * Change password of conected user
   * @param oldP old password
   * @param newP new password
   */
  changePassword(oldP: string, newP: string) {
    return this.http2.post<any>(SWIM_AUTH_API + "/change", {
      oldP,
      newP,
    });
  }

  /**
   * Call authentication mechanism
   * @param email user email
   * @param token user token
   * @param expiresIn token expiration
   */
  private handleAuthentication(
    email: string,
    token: string,
    expiresIn: number,
    id: number,
    isGuest: boolean,
    role?: string,
    isCont?: boolean
  ) {
    try {
      const expirationDate = new Date(new Date().getTime() + expiresIn);
      const user = new User(
        email,
        token,
        expirationDate,
        id,
        isGuest,
        role,
        isCont
      );
      this.user.next(user);
      // console.log(user);
      this.autoLogout(expiresIn);
      localStorage.setItem("userData", JSON.stringify(user));
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Handle authentication errors
   * @param errorRes error responses
   */
  private handleError(errorRes: any) {
    let errorMessage = "An error ocurred, try again later";
    // user response handled on backend
    if (typeof errorRes.error.message !== "undefined") {
      if (typeof errorRes.error.message.errors !== "undefined") {
        return throwError(errorRes.error.message.errors[0].message);
      }
      return throwError(errorRes.error.message);
    }
    // local error handler
    if (typeof errorRes.error.error.message !== "undefined") {
      switch (errorRes.error.error.message) {
        case "EMAIL_EXISTS":
          errorMessage = "This email already exists";
          break;
        case "EMAIL_NOT_FOUND":
        case "INVALID_PASSWORD":
          errorMessage = "Email or password are incorrect";
          break;
      }
    }

    return throwError(errorMessage);
  }
}
