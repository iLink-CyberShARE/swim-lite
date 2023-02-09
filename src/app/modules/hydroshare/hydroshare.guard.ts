import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";

@Injectable()
export class HSGuard implements CanActivate {
  constructor(
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Promise<boolean | UrlTree>
    | Observable<boolean | UrlTree> {
    if(localStorage.getItem("HSAuth") !== null){
      return true;
    }
    else {
      return this.router.createUrlTree(["/hs-oauthlogin"]);
    }
  }
}
