import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// datatable modules
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

// services
import { CustomScenariosService } from 'src/app/services/custom-scenarios.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-compare-dialog',
  templateUrl: './compare-dialog.component.html',
  styleUrls: ['./compare-dialog.component.css']
})
export class CompareDialogComponent implements OnInit {

  /** Flag to check if user is logged in */
  isAuthenticated = false;

  /** Subscription to the user authentication */
  private userSub =  new Subscription();

  /** scenario type selected */
  public scenarioType = 'public';

  /** loading flag */
  public isLoading = false;

  /** error response message */
  public errorText = '';

  /** List of previously run scenarios with current model */
  scenarioListing: any [] = [];

  /** list of selected scenarios to compare against */
  selectedScenarioIds: string [] = [];

  /** scenarios table columns */
  scenariosTableColumns: string [] = [
    'select',
    'name',
    'run'
  ];

  constructor(
    public dialogRef: MatDialogRef<CompareDialogComponent>,
    private customScenariosService: CustomScenariosService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public modelID: string,
  ) { }

  /** Data source for the catalog table */
  tableSource: any;

  /** MatPaginator current page  */
  private pageIndex = 0;

  /** Output selection model from table */
  selection = new SelectionModel<any>(true, []);

  /** Access to the paginator widget on the view */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Access to the sorting mechanism on the view */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Initialize by vieweing the public scenarios by default
   */
  ngOnInit() {
    // subscribe to user authentication changes
    this.userSub = this.authService.user.subscribe( user => {
      if (!!user) {
        this.isAuthenticated = !user.guestStatus;
      } else {
        this.isAuthenticated = false;
      }
    });

    this.loadPublicScenarios();
  }

  /**
   * Fetches public scenarios from the currently used model
   */
  private loadPublicScenarios() {
    this.isLoading = true;
    this.cleanData();
    this.scenarioType = 'public';
    this.customScenariosService.GetPublicScenariobyModel(this.modelID).pipe(
      map(response => {
        return response.result.map (scenarioCatalog => {
        return {
          id: scenarioCatalog._id,
          name: scenarioCatalog.name,
          run: scenarioCatalog.startedAtTime
        };
      });
    })).subscribe (transformed => {
      this.scenarioListing = transformed;
      // sort by run date from latest to oldest
      this.scenarioListing.sort((a, b) => ((a.run  === b.run) ? 0 : ((a.run < b.run) ? 1 : -1 )));
      this.tableSource = new MatTableDataSource();
      this.tableSource.data = this.scenarioListing;
      // set search filter by name column
      this.setupFilter('name');
      this.isLoading = false;
      setTimeout(() => (this.tableSource.paginator = this.paginator));
      setTimeout(() => (this.tableSource.sort = this.sort));
    }, (error) => {
      this.errorText = error.error.message;
      this.isLoading = false;
    });
  }

  /**
   * fetches private scenarios from currently logged in user
   */
  private loadPrivateScenarios() {
    this.isLoading = true;
    this.cleanData();
    this.scenarioType = 'private';
    this.customScenariosService.GetPrivateScenariobyModel(this.modelID).pipe(
      map(response => {
        return response.result.map (scenarioCatalog => {
        return {
          id: scenarioCatalog._id,
          name: scenarioCatalog.name,
          run: scenarioCatalog.startedAtTime
        };
      });
    })).subscribe (transformed => {
      this.scenarioType = 'private';
      this.scenarioListing = transformed;
      // sort by run date from latest to oldest
      this.scenarioListing.sort((a, b) => ((a.run  === b.run) ? 0 : ((a.run < b.run) ? 1 : -1 )));
      this.tableSource = new MatTableDataSource();
      this.tableSource.data = this.scenarioListing;
      // set search filter by name column
      this.setupFilter('name');
      this.isLoading = false;
      setTimeout(() => (this.tableSource.paginator = this.paginator));
      setTimeout(() => (this.tableSource.sort = this.sort));
    }, (error) => {
      this.errorText = error.error.message;
      this.isLoading = false;
    });
  }

  /**
   * Clean data structures and messages
   */
  private cleanData() {
    this.selection.clear();
    this.errorText = '';
    this.selectedScenarioIds = [];
    this.tableSource = null;
    this.tableSource = new MatTableDataSource();
  }

  /**
   * Closes the dialog and cancels the submission of the scenario.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Add selected scenario ids to selectedScenarios array and redirect
   * to the output details.
   */
  onCompareClick() {
    if (this.selection.selected.length > 0 ) {
      for (const row of this.selection.selected) {
        this.selectedScenarioIds.push(row.id);
      }
    }
  }

  /** Keep track of the current page index so we can return to it after a detail view */
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
  }

  /**
   * Filter out input table by string value applied to any column
   * @param filterValue Filter to be applied in string form
   */
  applyFilter(filterValue: string) {
    this.tableSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * On input focus: setup filterPredicate to only filter by input column
   * https://stackoverflow.com/questions/48276404/filtering-specific-column-in-angular-material-table-in-angular-5/
   * 48400406?noredirect=1#comment84008277_48400406
   */
  private setupFilter(column: string) {
    this.tableSource.filterPredicate = (d: string, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  /**
   * Event - filter by public scenarios.
   */
  onSelectPublic() {
    this.loadPublicScenarios();
  }

  /**
   * Event - filter by private (logged in user) scenarios.
   */
  onSelectPrivate() {
    this.loadPrivateScenarios();
  }

}
