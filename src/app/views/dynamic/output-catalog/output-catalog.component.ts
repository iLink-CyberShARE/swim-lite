import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { from, zip, of } from 'rxjs';
import { map, mergeMap, groupBy } from 'rxjs/operators';

// Data Models
import { ModelOutput } from '../../../models/output.model';

// Datatable modules
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

// Services
import { RecommenderService } from 'src/app/services/recommender.service';
import { ModelRunService } from '../../../services/model-run.service';
import { OutputService } from 'src/app/services/output.service';

// Components
import { StarRateComponent } from 'src/app/widgets/star-rate/star-rate.component';
import { CompareDialogComponent } from 'src/app/widgets/compare-dialog/compare-dialog.component';
import { CustomScenariosService } from 'src/app/services/custom-scenarios.service';

/**
 * Listing of the model output catalog after scenario execution
 */
@Component({
  selector: 'app-output-catalog',
  templateUrl: './output-catalog.component.html',
  styleUrls: [
    '../create-scenario/create-scenario.component.css',
    './output-catalog.component.css',
  ],
})
export class OutputCatalogComponent implements OnChanges, OnInit {
  /** Language index (english/spanish)  */
  lanIndex = 0;

  /** Hide Tools Instructions */
  public hideTools = false;

  /** Recommender Available */
  public recommAvailable = false;

  /**
   * Class constructor
   * @param recommenderService  SWIM recommender service
   * @param modelRunService  Model Run Service
   * @param dialog Dialog Window component
   */
  constructor(
    public recommenderService: RecommenderService,
    public modelRunService: ModelRunService,
    private customScenarioService: CustomScenariosService,
    public dialog: MatDialog,
    public outputService: OutputService
  ) {
    // set target information language
    this.lanIndex = outputService.lanIndex;
  }

  /** Screen mode catalog or details */
  mode = 'catalog';
  /** Component received the model catalog as input */
  @Input() outputCatalog: ModelOutput[];
  /** Event for when we are in detailed view */
  @Output() inDetails: EventEmitter<boolean> = new EventEmitter();

  /** Selected output category */
  selectedOutputCat = '';
  /** List of model output categories */
  outputCategories: string[] = [];
  /** List of model outputs to show on the table */
  outputListing: any[] = [];
  /** List of selected outputs for detail view */
  selectedOutputs: ModelOutput[] = [];
  /** List of selected outputs for compare view */
  compareOutputs: any[] = [];
  /** Columns to show on the listing/catalog table */
  outputCatalogColumns: string[] = [
    'Select',
    'Label',
    'Category',
    'Description',
    'Units',
  ];

  /** Data source for the catalog table */
  outputTableSource = new MatTableDataSource(this.outputListing);

  /** MatPaginator current page  */
  private pageIndex = 0;

  /** Output selection model from table */
  selection = new SelectionModel<any>(true, []);

  /** Access to the paginator widget on the view */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Access to the sorting mechanism on the view */
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    // flag form canned scenarios to switch between dynamic and static results
    this.hideTools = this.modelRunService.getToolStatus();

    // check availability of recommendations by evaluating the model against p@k
    this.recommenderService
      .evaluateModel(this.modelRunService.getModelID(), '')
      .subscribe(
        (response) => {
          // console.log(response);
          const score: number =+ response['p_at_k_score'];
          // minimum evaluation score above 0
          if (score > 0) {
            this.recommAvailable = true;
            this.sortByRecommender();
          }
        },
        (error) => {
          this.recommAvailable = false;
        }
      );
  }

  /**
   * Track changes on the output catalog so the output lists are refreshed
   * @param changes object changes
   */
  ngOnChanges(changes: SimpleChanges) {
    // clear output categories
    this.outputCategories = [];

    for (const property in changes) {
      if (property === 'outputCatalog') {
        const vSource = from(this.outputCatalog);

        vSource
          .pipe(
            groupBy((outputs) => outputs.varinfo[this.lanIndex].varCategory),
            mergeMap((group) => zip(of(group.key)))
          )
          .subscribe((category) => {
            this.outputCategories.push(category[0]);
            this.outputCategories.sort();
          });

        if (this.outputListing.length <= 0) {
          vSource
            .pipe(
              map((modelOutput) => {
                return {
                  Name: modelOutput.varName,
                  Label: modelOutput.varinfo[this.lanIndex].varLabel,
                  Category: modelOutput.varinfo[this.lanIndex].varCategory,
                  Description:
                    modelOutput.varinfo[this.lanIndex].varDescription,
                  Units: modelOutput.varinfo[this.lanIndex].varUnit,
                  Rank: -999,
                };
              })
            )
            .subscribe((transformedListing) => {
              this.outputListing.push(transformedListing);
              this.outputListing.sort((a, b) =>
                a.Label === b.Label ? 0 : a.Label > b.Label ? 1 : -1
              );
              setTimeout(
                () => (this.outputTableSource.paginator = this.paginator)
              );
              setTimeout(() => (this.outputTableSource.sort = this.sort));
            });
        }
      }
    }
  }

  /**
   * sort the output listing by recommender ranking
   */
  sortByRecommender() {
    this.recommenderService
      .getRoleID(this.modelRunService.getUserRole())
      .subscribe((response) => {
        const roleid = response['id'];
        const modelid = this.modelRunService.getModelID();
        const outputCount = this.outputListing.length;
        this.recommenderService
          .getRoleRecommendation(roleid, modelid, outputCount)
          .subscribe((response) => {
            const items = response['items'];
            // append the rank to each output on the listing
            for (const index in items) {
              const item = items[index];
              const output = this.outputListing.find(
                (o) => o.Name === item['item_name']
              );
              if (typeof output !== 'undefined') {
                output.Rank = item['rank_value'];
              }
            }

            // remove filters
            this.applyFilter('');

            // sort the listing by rank
            this.outputListing.sort((a, b) =>
              a.Rank === b.Rank ? 0 : a.Rank < b.Rank ? 1 : -1
            );

            setTimeout(
              () => (this.outputTableSource.paginator = this.paginator)
            );
            setTimeout(() => (this.outputTableSource.sort = this.sort));
          });
      });
  }

  /**
   * Filter out input table by string value applied to any column
   * @param filterValue Filter to be applied in string form
   */
  applyFilter(filterValue: string) {
    this.selectedOutputCat = filterValue;
    this.outputTableSource.filter = filterValue.trim().toLowerCase();
  }

  // On input focus: setup filterPredicate to only filter by input column
  // tslint:disable-next-line: max-line-length
  // https://stackoverflow.com/questions/48276404/filtering-specific-column-in-angular-material-table-in-angular-5/48400406?noredirect=1#comment84008277_48400406
  setupFilter(column: string) {
    this.outputTableSource.filterPredicate = (d: string, filter: string) => {
      const textToSearch = (d[column] && d[column].toLowerCase()) || '';
      return textToSearch.indexOf(filter) !== -1;
    };
  }

  applyFilterColumn(column: string, filterValue: string) {
    this.setupFilter(column);
    this.applyFilter(filterValue);
  }

  /**
   * Filters out selected row from the input table and displays parameters details.
   * @param row selected row from the input table
   */
  onViewSelected() {
    if (this.selection.selected.length > 0) {
      for (const set of this.selection.selected) {
        const selectedOutput = this.outputCatalog.filter(
          (output) => output.varName === set.Name
        )[0];
        this.selectedOutputs.push(selectedOutput);
      }
      this.inDetails.emit(true);
      this.mode = 'details';
    } else {
      console.log('No Outputs have been selected');
    }
  }

  /**
   * Clean selected output list
   */
  onDeselectAll() {
    this.selection.clear();
  }

  /**
   * Export catalog table to csv file.
   */
  onExportCatalog() {
    try {
      const CSVExport = new AngularCsv(this.outputListing, 'Output Catalog');
    } catch (error) {
      // TODO: log this with the error handlers
      console.log('Error Export Catalog: ' + error);
    }
  }

  /**
   * Open window with list of available scenarios to compare with.
   */
  onCompare() {
    // list of selected output ids
    const outputnames = [];
    this.compareOutputs = [];

    // pass the model id as a parameter to fetch scenarios from that model
    const dialogRef = this.dialog.open(CompareDialogComponent, {
      width: '700px',
      data: this.modelRunService.getModelID(),
      disableClose: false,
    });

    // return scenario ids to compare against
    dialogRef.afterClosed().subscribe((result) => {
      // get the currently checked outputs and add to the compare output list
      for (const set of this.selection.selected) {
        outputnames.push(set.Name);
        const modelOutput = this.outputCatalog.filter(
          (output) => output.varName === set.Name
        )[0];
        const compareOutput = {
          scenarioName: this.modelRunService.getScenarioName(),
          scenarioDescription: this.modelRunService.getScenarioDescription(),
          scenarioStartProjection: this.modelRunService.getProjectionStart(),
          output: modelOutput,
        };
        this.compareOutputs.push(compareOutput);
      }

      if (typeof result !== 'undefined' && outputnames.length > 0) {
        // this part is a test
        this.customScenarioService
          .GetCrossScenarios2(result, outputnames)
          .subscribe((responses) => {
            for (const response of responses) {
              // loop through scenarios
              for (const scenario of response.result) {
                // loop through each output from the scenarios
                for (const modelOutput of scenario.modelOutputs) {
                  const compareOutput = {
                    scenarioName: scenario._id.name,
                    scenarioDescription: scenario._id.description,
                    scenarioStartProjection: scenario._id.start, // careful here
                    output: modelOutput,
                  };
                  this.compareOutputs.push(compareOutput);
                }
              }
            }
            this.compareOutputs.sort((obj1, obj2) => {
              return obj1.output.varName > obj2.output.varName ? 1 : -1;
            });
            // change screen content
            this.mode = 'compare';
            this.inDetails.emit(true);
          });
      } else {
        console.log('Missing selections on scenarios or output');
      }
    });
  }

  /**
   *  Rank the selected output if it hasn't been ranked.
   *  Sets the selected input as null and takes back to the input catalog.
   */
  onBackToCatalog() {
    // load ranked items from local storage
    let rankedItems = JSON.parse(localStorage.getItem('rankedItems'));

    if (rankedItems === null) {
      rankedItems = []
    } else {
      for(const index in rankedItems){
        this.selectedOutputs = this.selectedOutputs.filter(x => x.varName !== rankedItems[index]);
      }
    }

    if(this.selectedOutputs.length > 0){
      const dialogRef = this.dialog.open(StarRateComponent, {
        width: '500px',
        data: this.selectedOutputs,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        for (const outputFeedback of result) {
          // get de output id from recommender database
          this.recommenderService.logExplicitFeedback(outputFeedback.outputName, outputFeedback.outputRating, this.modelRunService.getScenarioID(), this.modelRunService.getUserRole());
          // add to local cookie list
        }
      });
    }

    this.selectedOutputs = [];

    this.inDetails.emit(false);

    // this is a workaround, paginator and sort stop working if they are not reaasigned with setTimeout()
    setTimeout(() => {
      this.paginator.pageIndex = this.pageIndex;
      this.outputTableSource.paginator = this.paginator;
    });
    setTimeout(() => (this.outputTableSource.sort = this.sort));

    this.mode = 'catalog';
  }

  /** Keep track of the current page index so we can return to it after a detail view */
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
  }
}
