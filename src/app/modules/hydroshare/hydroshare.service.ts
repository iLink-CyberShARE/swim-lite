import { Injectable } from "@angular/core";
import { HttpClient, HttpBackend, HttpHeaders } from "@angular/common/http";
import { Resource } from "./models/resource.model";
import { HSUser } from "./models/hsuser.model";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { environment } from "src/environments/environment";

// make the service available on app level to prevent circular dependencies
@Injectable({
  providedIn: "root",
})
export class HydroShareService {
  /** Communication protocol libs */
  private http: HttpClient;

  /** HS session data */
  private userInfo: HSUser = null;
  hsuser = new BehaviorSubject<HSUser>(null);
  private resource: Resource = null;
  private tempResourceId: string = "";
  private tokenExpirationTimer: any;
  private tokenInitExp: number;

  /** HS API default URLs */
  private SWIM_HS = environment.SWIMHS;
  private HS_API = environment.HS_API;
  private HS_API2 = environment.HS_API2;

  /** Subscribable subject to updates on the resource */
  private resourceUpdated = new Subject<Resource>();

  /** Subscribable subject to updates on user information */
  private hsUserUpdated = new Subject<HSUser>();

  /**
   * HS Service constructor
   * @param handler http backend to bypass other other injectors
   */
  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
    // fetch user information with currently stored auth
    this.fetchUserInfo();
    // check if the token still valid, otherwise redirect to hs login

  }

  /**
   * Starts HS session using an authentication token
   * @param token authentication token
   * @param exp expiration time in ms
   * @returns
   */
  startHSessionToken(token: String, exp: number) {
    const path = "/user/";
    const authString = token;
    this.tokenInitExp = exp;

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + authString,
      }),
    };

    // Clear any current sessions
    this.removeCredentials();

    return this.http.get<HSUser>(this.HS_API + path, HTTP_OPTIONS).pipe(
      catchError(this.handleError),
      tap((response) => {
        this.autoLogout(this.tokenInitExp);
        this.handleSession(response, authString, "Bearer");
      })
    );

  }


  /**
   * Start a hydroshare session with basic authentication
   * @param username username or email address registered in HS
   * @param password secret password
   */
  startHSSession(username: String, password: String) {
    const path = "/user/";
    const authString = btoa(username + ":" + password);

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Basic " + authString,
      }),
    };

    // Clear any current sessions
    this.removeCredentials();

    return this.http.get<HSUser>(this.HS_API + path, HTTP_OPTIONS).pipe(
      catchError(this.handleError),
      tap((response) => {
        this.handleSession(response, authString, "Basic");
      })
    );
  }

  /**
   * Handle HS service call errors
   * @param error Object with error response
   * @returns processed error response
   */
  private handleError(error: any) {
    return throwError(error);
  }

  /**
   * Set local HydroShare session
   * Note: this method is prune to change when I add the token login mechanism
   * @param userInfo HS user information object
   * @param authString Validated authentication string
   */
  private handleSession(userInfo, authString, authType) {
    this.userInfo = userInfo;
    this.hsuser.next(userInfo);
    this.hsUserUpdated.next(JSON.parse(JSON.stringify(this.userInfo)));

    // save user auth string on local storage
    localStorage.setItem("HSAuth", authString);
    localStorage.setItem("AuthType", authType);
  }

  /**
   * Logout when token expires
   * @param expirationDuration time to expire
   */
   autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      // console.log('Token has expired!');
      this.removeCredentials();
      // reroute to hs login page
    }, expirationDuration);
  }

  /**
   * Remove in memory user information, loaded resource and
   * local storage data from browser
   */
  removeCredentials() {
    this.resource = null;
    this.hsuser.next(null);
    console.log("removing item from storage hsauth");
    localStorage.removeItem("HSAuth");
    localStorage.removeItem("AuthType");
    if (this.tokenExpirationTimer) {
      alert("Your Hydroshare session has expired");
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  /**
   * Clear loaded resource from memory
   */
  clearResource() {
    this.resource = null;
  }

  /**
   * Get user information and populate model.
   * hsapi
   */
  fetchUserInfo() {
    const path = "/user/";

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("AuthType") + " " + localStorage.getItem("HSAuth"),
      }),
    };

    this.http.get<HSUser>(this.HS_API + path, HTTP_OPTIONS).subscribe(
      (response) => {
        this.userInfo = response;
        this.hsuser.next(response);
        this.hsUserUpdated.next(JSON.parse(JSON.stringify(this.userInfo)));
      },
      (error) => {
        this.removeCredentials();
        console.log(error);
      }
    );
  }

  /**
   * Requests metadata from specified HS resource
   * @param resource_id HS resource identifier
   */
  fetchResourceMeta(resource_id) {
    const path = "/resource/" + resource_id + "/json/";

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("AuthType") + " " + localStorage.getItem("HSAuth"),
      }),
    };

    this.http.get<Resource>(this.HS_API2 + path, HTTP_OPTIONS).subscribe(
      (response) => {
        this.resource = response;
        this.resourceUpdated.next(JSON.parse(JSON.stringify(this.resource)));
        // console.log(this.resource); //for debug
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /**
   * Initialize HR resource
   */
  createBaseResource(
    title: string,
    abstract: string,
    keywords: Array<string>,
    type: string = "CompositeResource"
  ) {
    const path = "/resource/";

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("AuthType") + " " + localStorage.getItem("HSAuth"),
      }),
    };

    const payload: Resource = {
      title: title,
      abstract: abstract,
      keywords: keywords,
      resource_type: type,
    };

    return this.http.post<any>(this.HS_API + path, payload, HTTP_OPTIONS).pipe(
      catchError(this.handleError),
      tap((response) => {
        this.resource = payload;
        this.resource.resource_id = response["resource_id"];
        this.resource.resource_type = response["resource_type"];
        this.resourceUpdated.next(JSON.parse(JSON.stringify(this.resource)));
        // console.log(this.resource); //for debug
      })
    );
  }

  /**
   * Update metadata objects of an existing resource on Hydroshare.
   * Note: Uses hasapi2
   */
  updateResource(resource: Resource) {
    const path = "/resource/" + this.resource.resource_id + "/json/";

    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("AuthType") + " " + localStorage.getItem("HSAuth"),
      }),
    };

    // make a deep copy
    let payload = JSON.parse(JSON.stringify(resource));

    // cache resource id
    this.tempResourceId = this.resource.resource_id;

    // remove extra fields from the resource payload
    delete payload["resource_id"];
    delete payload["resource_type"];
    delete payload["identifier"];
    delete payload["modified"];
    delete payload["created"];
    delete payload["url"];
    delete payload["type"];

    // send payload to HS service
    return this.http.put<any>(this.HS_API2 + path, payload, HTTP_OPTIONS).pipe(
      catchError(this.handleError),
      tap((response) => {
        this.resource = response;
        this.resource.resource_id = this.tempResourceId;
        this.resource.resource_type = response["type"];
        this.resourceUpdated.next(JSON.parse(JSON.stringify(this.resource)));
        console.log("Resource after update:")
        // console.log(this.resource); //for debug
      })
    );
  }

  /**
   * Receives a JSON object that will be uploaded to a hydroshare
   * resource as a file.
   * @param file_name name of the file that will be in HS
   * @param payload content of the file as a JSON object
   */
  uploadSingleJSON(file_name: string, payload: Object) {
    // set api path
    const path =
      "/resource/" + this.resource.resource_id + "/files/";

    // set additional headers
    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        Accept: "*/*",
        Authorization: localStorage.getItem("AuthType") + " " + localStorage.getItem("HSAuth"),
      }),
    };

    // change the payload to a string
    const payload_string = JSON.stringify(payload);

    // change the string payload to a blob
    const payload_blob = new Blob([payload_string]);

    // prepare form data
    const formData = new FormData();
    formData.append("file", payload_blob, file_name);

    // send request
    return this.http.post<any>(this.HS_API + path, formData, HTTP_OPTIONS).pipe(
      catchError(this.handleError),
      tap((response) => {
        // console.log(response); //for debug
      })
    );
  }

  /**
   * Deletes a resource from the Hydroshare platform
   * @param resource_id resources unique identifier
   */
  deleteResource() {
    console.log("Removing Resource from HydroShare...");

    // set api path
    const path = "/resource/" + this.resource.resource_id;

    // set additional headers
    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        Accept: "*/*",
        Authorization: localStorage.getItem("AuthType") + " " + localStorage.getItem("HSAuth"),
      }),
    };

    this.http.delete<any>(this.HS_API + path, HTTP_OPTIONS).subscribe(
      (response) => {
        console.log(response); //for debug
      },
      (error) => {
        console.log(error);
      }
    );

  }

  /**
   *  Object Update listeners
   */

  /**
   * Get a listener to changes in user information
   * @returns observable user information object
   */
  getUserUpdateListener() {
    return this.hsUserUpdated.asObservable();
  }

  /**
   * Get a listener to changes in resource metadata
   * @returns observable resource object
   */
  getResourceUpdateListener() {
    return this.resourceUpdated.asObservable();
  }

  /**
   * Getters and Setters
   */

  /**
   * Get user information that was previously fetched
   * @returns HSUSer object
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * Get currently loaded resource
   * @returns
   */
  getLoadedResource() {
    return this.resource;
  }


  getSWIMHSLOGINURL() {
    return this.SWIM_HS + '/api/hs-auth/login'
  }

  /**
   * Retrieve the HydroShare API URL
   * @returns string with the hsapi url
   */
  getHSAPIURL() {
    return this.HS_API;
  }

  /**
   * Retrieve the HydroShare API 2 URL
   * @returns string with the hsapi2 url
   */
  getHSAPI2URL() {
    return this.HS_API2;
  }


}
