import {
  Component,
  OnInit,
  ViewChild,
  LOCALE_ID,
  Inject,
  OnDestroy
} from '@angular/core';
import { UserScenario } from 'src/app/models/user-scenario';
import { CustomScenariosService } from 'src/app/services/custom-scenarios.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

// Data Table Modules
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

// Dialog Components
import { MetadataDialogComponent } from 'src/app/widgets/metadata-dialog/metadata-dialog.component';
import { LinkDialogComponent } from 'src/app/widgets/link-dialog/link-dialog.component';
import { RoleDialogComponent} from 'src/app/widgets/role-dialog/role-dialog.component'

// Environment
import { environment } from '../../../../environments/environment';

// icons
import { faUsers } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-public-scenarios',
  templateUrl: './public-scenarios.component.html',
  styleUrls: ['./public-scenarios.component.css']
})

export class PublicScenariosComponent implements OnInit, OnDestroy {

  faUsers = faUsers;

  /** loading flag */
  public isLoading = false;

  /** base url */
  private baseurl =  environment.baseurl;

  /** locale language */
  private lang = 'en';

  /**
   * List of user scenarios metadata
   */
  private scenariosList: any[] = [];

  /**
   * Subscriber to user scenarios changes
   */
  private scenariosListSub: Subscription;

  /** Table columns on the input listing */
  listingColumns: string[] = [
    'name',
    'startedAtTime',
    'endedAtTime',
    'status',
    'ID1',
    'ID2',
    'ID3'
  ];

  scenarioTableSource: any;

  constructor(
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
    this.customScenarioService.GetPublicScenarios();
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
   * Open metadata popup window with metadata values
   * @param customscenario selected public scenario
   */
  onViewMetadata(customscenario: any) {
    const dialogRef = this.dialog.open(MetadataDialogComponent, {
      width: '500px',
      data: customscenario
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
   * Open share link window
   * @param link link address
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
   * Table filter from the search bar
   * @param filterValue text to filter by
   */
  applyFilter(filterValue: string) {
    this.scenarioTableSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Remove subscriptions on component destroyed
   */
  ngOnDestroy() {
    this.scenariosListSub.unsubscribe();
  }

}

