import { Component, Output, EventEmitter } from "@angular/core";
import { Router } from '@angular/router';
import {
  faSwimmer,
  faSwimmingPool,
  faHome,
  faChartArea,
  faImage,
  faQuestion,
  faBalanceScale,
  faCogs,
  faArchive,
  faUsers,
  faLifeRing,
  faBook,
  faUser,
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
import { AuthService } from "../../../auth/auth.service";
import { Subscription } from "rxjs";

/**
 * Side navigation for mobile devices
 */
@Component({
  selector: "app-sidenav-list",
  templateUrl: "./sidenav-list.component.html",
  styleUrls: ["./sidenav-list.component.css"],
})
export class SidenavListComponent {
  faHome = faHome;
  faChartArea = faChartArea;
  faImage = faImage;
  faQuestion = faQuestion;
  faBalanceScale = faBalanceScale;
  faCogs = faCogs;
  faArchive = faArchive;
  faUsers = faUsers;
  faLifeRing = faLifeRing;
  faBook = faBook;
  faUser = faUser;
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

  /** Flag to check if user is logged in */
  isAuthenticated = false;

  /** Subscription to the user authentication */
  private userSub = new Subscription();

  /** Signal when the side navigation is closed */
  @Output() sidenavClose = new EventEmitter();

  /** Class constructor */
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

  /** When close button is pressed  */
  public onSidenavClose = () => {
    this.sidenavClose.emit();
  };

  /**
   * Sign out a user from the site.
   */
   onLogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

}
