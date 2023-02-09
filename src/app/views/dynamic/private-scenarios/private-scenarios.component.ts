import { Component, OnInit, LOCALE_ID, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomScenariosService } from 'src/app/services/custom-scenarios.service';
import { UserScenario } from 'src/app/models/user-scenario';
import { MatDialog } from '@angular/material/dialog';

// Data Table Modules
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

// Dialog popups
import { MetadataDialogComponent } from 'src/app/widgets/metadata-dialog/metadata-dialog.component';
import { LinkDialogComponent } from 'src/app/widgets/link-dialog/link-dialog.component';
import { RoleDialogComponent} from 'src/app/widgets/role-dialog/role-dialog.component'
import { CanDialogComponent } from 'src/app/widgets/can-dialog/can-dialog.component';

// Environment
import { environment } from '../../../../environments/environment';

// Icons
import { faUser, faImage } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { HydroShareService } from 'src/app/modules/hydroshare/hydroshare.service';


@Component({
  selector: 'app-private-scenarios',
  templateUrl: './private-scenarios.component.html',
  styleUrls: ['../public-scenarios/public-scenarios.component.css']
})
export class PrivateScenariosComponent implements OnInit, OnDestroy {

  faUser= faUser;
  faImage = faImage;

  /** Loading widget */
  public isLoading = false;

  /** Base url */
  private baseurl =  environment.baseurl;

  /** Locale for share link */
  private lang = 'en';

  /** List of user scenarios metadata */
  private scenariosList: any[] = [];

  /** Subscriber to user scenarios changes */
  private scenariosListSub: Subscription;

  /** Table columns on the input listing */
    listingColumns: string[] = [
      'name',
      'startedAtTime',
      'endedAtTime',
      'status',
      'ID1',
      'ID2',
      'ID3',
      'ID4',
      'ID5',
      'ID6'
    ];

    /** datatable source of content */
  scenarioTableSource: any;

  constructor(
    private _router: Router,
    private _hydroshareService: HydroShareService,
    private customScenarioService: CustomScenariosService,
    public dialog: MatDialog,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.lang = this.locale.toLowerCase();
    this.lang = this.lang.substring(0, 2);
   }

  /** Access to paginator object on the view */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Access to sort mechanisms on the view */
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.isLoading = true;
    if (this.getCont() !== 1) {
      this.listingColumns = [
        'name',
        'startedAtTime',
        'endedAtTime',
        'status',
        'ID1',
        'ID2',
        'ID3',
        'ID4',
        'ID6'
      ];
    }
    this.customScenarioService.GetMyScenarios();
    this.scenariosListSub = this.customScenarioService
    .GetScenarioListListener()
    .subscribe((scenariosList: UserScenario[]) => {
      this.scenariosList = scenariosList;
      this.scenariosList.sort((a, b) => ((a.startedAtTime  === b.startedAtTime) ? 0 : ((a.startedAtTime < b.startedAtTime) ? 1 : -1 )));
      this.scenarioTableSource = new MatTableDataSource();
      this.scenarioTableSource.data = this.scenariosList;
      this.isLoading = false;
      setTimeout(() => (this.scenarioTableSource.paginator = this.paginator));
      setTimeout(() => (this.scenarioTableSource.sort = this.sort));
    });
  }


  /**
   * open dialog to select role and load scenario results
   * @param customscenario
   */
  onAllOutputs(scenarioId: string){
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '500px',
      data: scenarioId
    });
  }

  /**
   * Open metadata popup window with metadata values
   * @param customscenario selected public scenario
   */
  onViewMetadata(customscenario: any) {
    this.dialog.open(MetadataDialogComponent, {
      width: '500px',
      data: customscenario
    });
  }

  /**
   * Open share link window
   * @param id link address
   */
  onShareLink(id: string) {
    let lan = '';
    if (environment.production === true) {
      lan = '/' + this.lang;
    }
    const fullLink = this.baseurl + lan + '/load-scenario/' + id;
    this.dialog.open(LinkDialogComponent, {
      width: '350px',
      data: fullLink
    });
  }

  /**
   * Redirect to HS resource form
   * @param id scenario run identifier
   */
  onPublish(id: string) {
    console.log('publishing here and there');

    // redirect to the component use routing here...
    this._router.navigate(['hs-form', id]);

  }

  /**
   * Open canned scenario options forms
   * @param id scenario run idenfitifer
   */
  onCanScenario(id: string) {
    this.dialog.open(CanDialogComponent, {
      width: '500px',
      data: id
    });
  }

  /**
   * on scenario delete
   */
  onDeleteScenario(id: string) {
    const answer = window.confirm('Are you sure you want to delete this scenario?');
    if (answer) {
      this.isLoading = true;
      this.customScenarioService.DeleteMyScenario(id).subscribe((result) => {
        // reload scenarios
        this.customScenarioService.GetMyScenarios();
      });
    }
  }

  /**
   * Table filter from the search bar
   * @param filterValue text to filter by
   */
  applyFilter(filterValue: string) {
    this.scenarioTableSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Get cont flag from user data
   */
  getCont() {
    try {
      return JSON.parse(localStorage.getItem('userData')).isCont;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Remove subscriptions on component destroyed
   */
  ngOnDestroy() {
    this.scenariosListSub.unsubscribe();
  }

}
