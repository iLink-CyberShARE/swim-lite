import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';

// Data models
import { Parameter } from '../../../models/parameter.model';

// Data Table Modules
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';

// Object manipulation
import { from, zip, of } from 'rxjs';
import { map, mergeMap, groupBy } from 'rxjs/operators';
import { UnitConverter } from 'src/app/lib/unit-converter.component';
import { ParameterService } from 'src/app/services/parameter.service';

// Services

/**
 * Input catalog screen on the create scenario workflow.
 * Contains a searchable and filterable listing of parameters used on the target model.
 */
@Component({
  selector: 'app-input-catalog',
  templateUrl: './input-catalog.component.html',
  styleUrls: [
    './input-catalog.component.css',
    '../create-scenario/create-scenario.component.css'
  ]
})

export class InputCatalogComponent implements OnInit, OnChanges {

  /** Class constructor */
  constructor(public parameterService: ParameterService) {
    this.lanIndex = parameterService.lanIndex;
  }

  /** Language index (english/spanish) */
  lanIndex = 0;
  /** Catalog visualization mode or details */
  mode = 'catalog';
  /** Receives the paramaterCatalog listing as input */
  @Input() parameterCatalog: Parameter[];
  /** Event for when we are in detailed view */
  @Output() inDetails: EventEmitter<boolean> = new EventEmitter();

  /** Unit Conversion */
  private unitConverter: UnitConverter;

  /** Selected parameter from the list */
  selectedInput: Parameter = null;
  private originalUnits = '';

  /** Selected input category */
  selectedInputCat = '';
  /** Listing of model input categories */
  inputCategories: string[] = [];
  /** Input listing to show on the table */
  inputListing: any[] = [];
  /** Table columns on the input listing */
  inputCatalogColumns: string[] = [
    'Label',
    'Category',
    'Description',
    'Max',
    'Min',
    'Units'
  ];

  /** Assignment of data source for the table */
  inputTableSource = new MatTableDataSource(this.inputListing);

  /** MatPaginator current page  */
  private pageIndex = 0;

  /** Access to paginator object on the view */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Access to sort mechanisms on the view */
  @ViewChild(MatSort) sort: MatSort;

  /**
   *  Component initiallization function
   */
  ngOnInit() {
    this.mode = 'catalog';

    // Load unit conversion class
    this.unitConverter = new UnitConverter();

    this.unitConverter.setLanguage(this.parameterService.locale.toLowerCase());
  }

  /**
   * Detects changes on attributes received from parent component
   * @param changes parent attribute change monitor
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'parameterCatalog') {
        // set parameter catalog as manipulation source
        const pSource = from(this.parameterCatalog);

        // Extract unique parameter categories and push to the input category list
        // This is used to generate category buttons dynamically
        pSource
          .pipe(
            groupBy(category => category.paraminfo[this.lanIndex].paramCategory),
            mergeMap(group => zip(of(group.key)))
          )
          .subscribe(category => {
            this.inputCategories.push(category[0]);
            this.inputCategories.sort();
          });

        // Map parameter catalog to the parameter table shown to the user
        if (this.inputListing.length <= 0) {
          pSource
            .pipe(
              map(modelInput => {
                return {
                  Name: modelInput.paramName,
                  Label: modelInput.paraminfo[this.lanIndex].paramLabel,
                  Category: modelInput.paraminfo[this.lanIndex].paramCategory,
                  Description: modelInput.paraminfo[this.lanIndex].paramDescription,
                  Max: modelInput.maxValue,
                  Min: modelInput.minValue,
                  Units: modelInput.paraminfo[this.lanIndex].paramUnit,
                  Editable: modelInput.definitionType
                };
              })
            )
            .subscribe(transformedListing => {
              this.inputListing.push(transformedListing);
              this.inputListing.sort((a, b) => ((a.Label  === b.Label) ? 0 : ((a.Label > b.Label) ? 1 : -1 )));
              this.applyFilter('user');
              setTimeout(
                () => (this.inputTableSource.paginator = this.paginator)
              );
              setTimeout(() => (this.inputTableSource.sort = this.sort));
            });
        }
      }
    }
  }

  /**
   * Filter out input table by string value applied to any column
   * @param filterValue Filter to be applied in string form
   */
  applyFilter(filterValue: string) {
    this.selectedInputCat = filterValue;
    this.inputTableSource.filter = filterValue.trim().toLowerCase();
  }


  // On input focus: setup filterPredicate to only filter by input column
  // tslint:disable-next-line: max-line-length
  // https://stackoverflow.com/questions/48276404/filtering-specific-column-in-angular-material-table-in-angular-5/48400406?noredirect=1#comment84008277_48400406
  setupFilter(column: string) {
    this.inputTableSource.filterPredicate = (d: string, filter: string) => {
      const textToSearch = d[column] && d[column].toLowerCase() || '';
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
  onSelectInput(row: any) {
    const inputName = row.Name;
    this.selectedInput = this.parameterCatalog.filter(
      parameter => parameter.paramName === inputName
    )[0];
    this.originalUnits = this.selectedInput.paraminfo[this.lanIndex].paramUnit;
    this.inDetails.emit(true);
    this.mode = 'detail';
  }

  /**
   * Exports the catalog table to csv/excel file
   */
  onExportCatalog() {
    const CSVExport = new AngularCsv(this.inputListing, 'Input Catalog');
  }

  /**
   *  Sets the selected input as null and takes back to the input catalog.
   */
  onBackToCatalog() {

    // before change back
    // console.log(this.selectedInput);

    // Changes back to original units
    if (this.selectedInput.paraminfo[this.lanIndex].paramUnit !== this.originalUnits) {
      console.log('Changing units back to original...');

      let conversionFail = false;
      const nonOriginalUnits = this.selectedInput.paraminfo[this.lanIndex].paramUnit;

      if (this.selectedInput.structType === 'scalar') {
        const scalarValue = this.unitConverter.Convert(nonOriginalUnits, this.originalUnits, this.selectedInput.paramValue);
        const defaultScalarValue = this.unitConverter.Convert(nonOriginalUnits, this.originalUnits, this.selectedInput.paramDefaultValue);
        if (scalarValue !== null && defaultScalarValue !== null) {
          this.selectedInput.paramValue = scalarValue;
          this.selectedInput.paramDefaultValue = defaultScalarValue;
        } else {
          // back to original unit conversion fail here
          this.selectedInput.paraminfo[this.lanIndex].paramUnit = this.originalUnits;
          conversionFail = true;
        }
      } else {
        // the unit conversion for the parameter values
        for (const v in this.selectedInput.paramValue) {
          if (v !== null) {
            const val = this.unitConverter.Convert(nonOriginalUnits, this.originalUnits,
              this.selectedInput.paramValue[v].value);
            const defaultVal = this.unitConverter.Convert(nonOriginalUnits, this.originalUnits,
                this.selectedInput.paramDefaultValue[v].value);
            if (val !== null) {
              this.selectedInput.paramValue[v].value = val;
              this.selectedInput.paramDefaultValue[v].value = defaultVal;
            } else {
              this.selectedInput.paraminfo[this.lanIndex].paramUnit = this.originalUnits;
              console.log('Conversion returned null');
              conversionFail = true;
              break;
            }
          }
        }
      }

      if (!conversionFail) {
      // convert the upper bound
      this.selectedInput.maxValue = this.unitConverter.Convert(nonOriginalUnits, this.originalUnits,
        this.selectedInput.maxValue);

      // convert the lower bound
      this.selectedInput.minValue = this.unitConverter.Convert(nonOriginalUnits, this.originalUnits,
        this.selectedInput.minValue);

      // the unit conversion for the parameter benchamrks
      for (const bIndex in this.selectedInput.paramBenchMarks) {
        if (bIndex !== null) {
          this.selectedInput.paramBenchMarks[bIndex].benchmarkValue =
          this.unitConverter.Convert(nonOriginalUnits, this.originalUnits,
          this.selectedInput.paramBenchMarks[bIndex].benchmarkValue);
        }
      }

      // set the units metadata to the converted name
      this.selectedInput.paraminfo[this.lanIndex].paramUnit = this.originalUnits;
      }

    }

    // after change back
    // console.log(this.selectedInput);

    this.selectedInput = null;

    this.inDetails.emit(false);

    // this is a workaround, paginator and sort stop working if they are not reaasigned with setTimeout()
    // setTimeout(() => (this.inputTableSource.paginator = this.paginator));
    setTimeout(() => {
      this.paginator.pageIndex = this.pageIndex;
      this.inputTableSource.paginator = this.paginator;
    });
    setTimeout(() => (this.inputTableSource.sort = this.sort));

  }

  /** Keep track of the current page index so we can return to it after a detail view */
  onPageChange(event) {
    this.pageIndex = event.pageIndex;
  }

}
