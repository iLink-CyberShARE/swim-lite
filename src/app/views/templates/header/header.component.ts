import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../../auth/auth.service";
import { environment } from '../../../../environments/environment';

import {
  faSwimmer,
  faSwimmingPool,
  faHome,
  faBalanceScale,
  faCogs,
  faChartArea,
  faArchive,
  faUsers,
  faUser,
  faImage,
  faLifeRing,
  faBook,
  faQuestion,
  faKey,
  faSignOutAlt,
  faLightbulb,
  faTruckLoading,
  faUserFriends,
  faTree,
  faMap,
  faDatabase,
  faServer,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

/**
 * Website header and navigation
 */
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  faHome = faHome;
  faBalanceScale = faBalanceScale;
  faCogs = faCogs;
  faChartArea = faChartArea;
  faArchive = faArchive;
  faUsers = faUsers;
  faUser = faUser;
  faImage = faImage;
  faLifeRing = faLifeRing;
  faBook = faBook;
  faQuestion = faQuestion;
  faKey = faKey;
  faSignOutAlt = faSignOutAlt;
  faSwimmingPool = faSwimmingPool;
  faSwimmer = faSwimmer;
  faLightbulb = faLightbulb;
  faTruckLoading = faTruckLoading;
  faUserFriends = faUserFriends;
  faTree = faTree;
  faMap = faMap;
  faDatabase = faDatabase;
  faServer = faServer;
  faSearch = faSearch;

  /** URLs */
  base_url_en =  environment.baseurl + '/en';
  base_url_es =  environment.baseurl + '/es';
  api_docs = environment.nodeServer + '/api-docs';

  /** Flag to check if user is logged in */
  isAuthenticated = false;

  /** Subscription to the user authentication */
  private userSub = new Subscription();

  /** Signals when the sidenavigation is open or closed */
  @Output() public sidenavToggle = new EventEmitter();

  /**
   * Class constructor
   * @param authService user authentication service
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Subscribe to user authentication changes
   */
  ngOnInit() {
    this.userSub = this.authService.user.subscribe((user) => {
      if (!!user) {
        this.isAuthenticated = !user.guestStatus;
      } else {
        this.isAuthenticated = false;
      }
    });
  }

  /**
   * Destructor method.
   */
  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  /**
   * Open or close side navigation panel on mobile devices.
   */
  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };

  /**
   * Sign out a user from the site.
   */
  onLogout() {
    this.authService.logout();
    this.router.navigate(["/home"]);
  }
}
