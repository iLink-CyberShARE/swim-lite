import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

// Data Models
import { Theme, RelatedParameter } from '../../../models/theme.model';
import { PalleteConstants } from 'src/app/models/pallete.model';

// Services
import { AcronymCatalogService } from '../../../services/acronym-catalog.service';
import { ParameterService } from '../../../services/parameter.service';
import { ParamBenchmark, Parameter } from 'src/app/models/parameter.model';
import { UnitConverter } from 'src/app/lib/unit-converter.component';
import { ThemeCatalogService } from 'src/app/services/theme-catalog.service';
import { ModelRunService } from 'src/app/services/model-run.service';

/**
 * Shows data details of scenario theme
 */
@Component({
  selector: 'app-theme-detail',
  templateUrl: './theme-detail.component.html',
  styleUrls: ['./theme-detail.component.css']
})
export class ThemeDetailComponent implements OnInit {
  /** loading flag */
  isLoading = false;

  /** projection start date for x axis on charts */
  private startDate;

  /** Palette Dictionary */
  paletteDictionary: PalleteConstants;

  /** Unit Conversion */
  private unitConverter: UnitConverter;

  /** Currently selected units */
  selectedUnit: string;

  /** Previous units before change */
  private oldUnits: string = null;

  /** Unit conversion options for this output */
  unitOptions: string[] = [];

  /** Chart Ready Flag */
  chartReady = true;
  private benchMarkIndex = 0;

  /** Acronym dictionary */
  private acronymDictionary: any = {};

  /** Related Parameter */
  relatedParam: Parameter;

  /** Auxilary Related Parameter for Unit Conversion (using its values) */
  private auxRelatedParam: Parameter = null;

  /** Auxilary selected parameetr for unit conversion (using its benchmakrs) */
  public auxSelectedParam: RelatedParameter = null;

  /** Selected related parameter to view data */
  selectedParam: RelatedParameter;

  /** ChartJS appended datasets */
  public lineChartData: ChartDataSets[] = [];
  /** ChartJS Label list */
  public lineChartLabels: Label[] = [];
  /** Flag to reverse the Y axis order (flip the chart) */
  public reverse = false;
  /** ChartJS color list */
  public lineChartColors: Color[] = [];
  /** Flag to show dataset legends */
  public lineChartLegend = true;
  /** The type of chart to be displayed (line or bar) */
  public lineChartType = 'line';
  /** JSON object with ChartJS options and configurations */
  public lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            reverse: this.reverse
          },
          scaleLabel: {
            display: true,
            labelString: null
          }
        }
      ]
    },
    hover: { mode: null },
    title: {
      display: false,
      text: null,
      fontSize: 32
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  };

  /** Access to the chart object */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /** Class constructor.
   *  This is a dialog component.
   *  Uses AcronymCatalog and Parameter Service.
   *  Received Injection of the selected theme.
   */
  constructor(
    public dialogRef: MatDialogRef<ThemeDetailComponent>,
    public acronymCatalogService: AcronymCatalogService,
    public parameterService: ParameterService,
    public themeCatalogService: ThemeCatalogService,
    private modelRunService: ModelRunService,
    @Inject(MAT_DIALOG_DATA) public selectedTheme: Theme
  ) {}

  /**
   * Create and load data chart
   */
  ngOnInit() {

    // load projection start date
    this.startDate = this.modelRunService.getProjectionStartInner();

    // Load plot pallete dictionary
    this.paletteDictionary = new PalleteConstants();

    // Load unit conversion class
    this.unitConverter = new UnitConverter();

    // Set unit conversion language
    this.unitConverter.setLanguage(
      this.themeCatalogService.locale.toLowerCase()
    );

    // Load the first available parameter on the list
    this.selectedParam = this.selectedTheme.parameters[0];

    // Load related parameter to this theme
    this.relatedParam = this.parameterService.getParameterMetaByName(
      this.selectedTheme.parameters[0].paramName
    );

    // extract the parameter units and add label to y-axis
    this.selectedUnit = this.relatedParam.paraminfo[
      this.themeCatalogService.lanIndex
    ].paramUnit;
    this.oldUnits = this.relatedParam.paraminfo[
      this.themeCatalogService.lanIndex
    ].paramUnit;
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = this.relatedParam.paraminfo[
      this.themeCatalogService.lanIndex
    ].paramUnit;

    // Load acronym dictionary
    this.acronymDictionary = this.acronymCatalogService.getAcronymDictionary();

    // temp fix
    if (this.relatedParam.structType === 'scalar') {
      this.auxRelatedParam = JSON.parse(JSON.stringify(this.relatedParam));
      this.auxSelectedParam = JSON.parse(JSON.stringify(this.selectedParam));
    }

    // Append data from selected theme to the chart
    this.chartAppendData(this.selectedParam);

    // add benchmark data to the plot if any
    this.appendBenchmarks(this.relatedParam);

    // load the convertion options for this parameter
    this.unitOptions = this.unitConverter.GetConversionOptions(
      this.relatedParam.paraminfo[this.themeCatalogService.lanIndex].paramUnit
    );
  }

  /**
   * Converts paramValue into chart JS data structures
   */
  chartAppendData(selectedParam: RelatedParameter) {
    // variable declaration
    const dimensionIndexes: string[] = []; // table dimension
    const values = {};
    const datasetNames: string[] = [];
    let isTimeseries = false;
    const startIndex = this.lineChartData.length;
    this.lineChartType = 'line';

    // get dimension indexes if any - the t index is reserved for timeseries year
    for (const key in selectedParam.paramValue[0]) {
      if (key !== null && key !== 'value' && key !== 't') {
        dimensionIndexes.push(key);
      } else if (key === 't') {
        isTimeseries = true;
      }
    }

    // data structure transformation
    for (let i = 0; i < selectedParam.paramValue.length; i++) {
      let index: any;
      let datasetName = '';

      // x axis label index if the dataset includes year on t index
      if (isTimeseries) {
        index = +selectedParam.paramValue[i].t;
        if (dimensionIndexes.length === 0) {
          datasetName = selectedParam.paramName;
        }
      } else {
        if (typeof this.startDate === 'undefined') {
          index = i.toString();
        } else {
          index = +this.startDate + i;
        }
        datasetName = selectedParam.paramName;
        if (dimensionIndexes.length > 0) {
          this.lineChartType = 'bar';
          datasetName = '';
          index = dimensionIndexes[0];
          if (index in this.acronymDictionary.dictionary) {
            index = this.acronymDictionary.dictionary[index];
          }
        }
      }

      // translate code acronym to user label
      if (datasetName in this.acronymDictionary.dictionary) {
        datasetName = this.acronymDictionary.dictionary[datasetName];
      }

      // concatenate each set for a dataset name
      for (let j = 0; j < dimensionIndexes.length; j++) {
        let legend = selectedParam.paramValue[i][dimensionIndexes[j]];
        if (legend in this.acronymDictionary.dictionary) {
          legend = this.acronymDictionary.dictionary[legend];
        }
        datasetName += legend + '-';
      }

      // remove the last dash character
      if (datasetName.lastIndexOf('-') === datasetName.length - 1) {
        datasetName = datasetName.slice(0, -1);
      }

      // push the x axis label if not already there (x axis labels)
      if (this.lineChartLabels.indexOf(index) === -1) {
        this.lineChartLabels.push(index);
      }

      // push the dataset name if not already there (plot legends)
      if (datasetNames.indexOf(datasetName) === -1) {
        datasetNames.push(datasetName);
        values[datasetNames.indexOf(datasetName)] = new Array();
      }

      values[datasetNames.indexOf(datasetName)].push(
        selectedParam.paramValue[i].value
      );

      // prepare line chart data
      for (let n = 0; n < datasetNames.length; n++) {
        const ds = {
          label: datasetNames[n],
          data: values[n],
          hidden: false,
          fill: false,
          borderColor: this.paletteDictionary.getLinePallete(n).colorRGB,
          backgroundColor: this.paletteDictionary.getLinePallete(n).colorRGB,
          borderDash: this.paletteDictionary.getLinePallete(n).pattern,
          pointBackgroundColor: this.paletteDictionary.getLinePallete(n)
            .colorRGB
        };
        this.lineChartData[startIndex + n] = ds;
      }
    }
  }

  /**
   * Append benchmark value to chart
   * This function is to be called after chart data has been appended.
   * @param benchmark benchmark object to append
   */
  chartAppendBenchmarkData(benchmark: ParamBenchmark) {
    const values = [];

    // if the dataset is already included just exit the function
    for (const dataSet of this.lineChartData) {
      if (dataSet.label === benchmark.benchmarkLabel) {
        // console.log(benchmark.benchmarkLabel + 'is already appended to the chart'); //for debug
        return;
      }
    }

    for (const label of this.lineChartLabels) {
      values.push(benchmark.benchmarkValue);
    }

    const ds = {
      label: benchmark.benchmarkLabel,
      radius: 0,
      data: values,
      hidden: false,
      fill: false,
      borderColor: this.paletteDictionary.getBenchmarkPallete(
        this.benchMarkIndex
      ).colorRGB,
      backgroundColor: this.paletteDictionary.getBenchmarkPallete(
        this.benchMarkIndex
      ).colorRGB,
      borderDash: this.paletteDictionary.getBenchmarkPallete(
        this.benchMarkIndex
      ).pattern
    };

    this.lineChartData.push(ds);
    this.benchMarkIndex++;
  }

  /**
   * Append SWIM benchmark data
   */
  private appendBenchmarks(relatedParameter: Parameter) {
    try {
      if (relatedParameter.paramBenchMarks === undefined) {
        return;
      }
      if (relatedParameter.paramBenchMarks !== null) {
        for (const benchmark of relatedParameter.paramBenchMarks) {
          // add benchmarks for the current target language
          if (
            benchmark.benchmarkLang ===
            this.themeCatalogService.locale.toLocaleLowerCase()
          ) {
            this.chartAppendBenchmarkData(benchmark);
          }
        }
      }
    } catch (error) {
      console.log('Error appendBenchmarks: ' + error);
    }
  }

  /**
   * Load dataset from the selected related parameter.
   */
  public onSelectRelatedParam() {
    this.isLoading = true;
    this.chartReady = false;

    // cholo mode clean graph
    this.lineChartData = [];
    this.lineChartLabels = [];

    this.auxRelatedParam = null;
    this.auxSelectedParam = null;

    // Load related parameter to this theme
    this.relatedParam = this.parameterService.getParameterMetaByName(
      this.selectedParam.paramName
    );

    // extract the parameter units and add label to y-axis
    const units = this.relatedParam.paraminfo[this.themeCatalogService.lanIndex].paramUnit;

    this.unitOptions = this.unitConverter.GetConversionOptions(units);
    this.selectedUnit = units;
    this.oldUnits = units;
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = units;

    // temp fix
    if (this.relatedParam.structType === 'scalar') {
      this.auxRelatedParam = JSON.parse(JSON.stringify(this.relatedParam));
      this.auxSelectedParam = JSON.parse(JSON.stringify(this.selectedParam));
    }

    // Append data from selected theme to the chart
    this.chartAppendData(this.selectedParam);

    // add benchmark data to the plot if any
    this.appendBenchmarks(this.relatedParam);

    setTimeout(() => {
      this.isLoading = false;
      this.chartReady = true;
    }, 150);

  }

  /**
   * Dialog close on cancel.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Change selected parameter values to the unit specified and append to charts
   */
  onSelectUnit() {
    console.log(
      'Converting from: ' + this.oldUnits + ' to: ' + this.selectedUnit
    );

    if (this.auxRelatedParam === null && this.auxSelectedParam === null) {
      this.auxRelatedParam = JSON.parse(JSON.stringify(this.relatedParam));
      this.auxSelectedParam = JSON.parse(JSON.stringify(this.selectedParam));
    }

    // need to fix scalar conversions here
    if (this.auxRelatedParam.structType === 'scalar') {
      const scalarValue = this.unitConverter.Convert(
        this.oldUnits,
        this.selectedUnit,
        this.auxSelectedParam.paramValue
      );
      if (scalarValue !== null) {
        this.auxSelectedParam.paramValue = scalarValue;
      } else {
        // conversion failed here and returned null, reset to old units and return
        console.log('Conversion returned null');
        return;
      }
    } else {
      // the unit conversion for the parameter values
      for (const v in this.auxSelectedParam.paramValue) {
        if (v !== null) {
          const val = this.unitConverter.Convert(
            this.oldUnits,
            this.selectedUnit,
            this.auxSelectedParam.paramValue[v].value
          );
          if (val !== null) {
            this.auxSelectedParam.paramValue[v].value = val;
          } else {
            console.log('Conversion returned null');
            return;
          }
        }
      }
    }

    // the unit conversion for the parameter benchamrks
    for (const bIndex in this.auxRelatedParam.paramBenchMarks) {
      if (bIndex !== null) {
        this.auxRelatedParam.paramBenchMarks[
          bIndex
        ].benchmarkValue = this.unitConverter.Convert(
          this.oldUnits,
          this.selectedUnit,
          this.auxRelatedParam.paramBenchMarks[bIndex].benchmarkValue
        );
      }
    }

    // update the unit conversion
    this.unitOptions = this.unitConverter.GetConversionOptions(
      this.selectedUnit
    );

    this.oldUnits = this.selectedUnit;

    /**** redraw graphs ****/

    if (this.auxRelatedParam.structType !== 'scalar') {
      this.isLoading = true;
      this.chartReady = false;

      // cholo mode clean graph
      this.lineChartData = [];
      this.lineChartLabels = [];

      // extract the parameter units and add label to y-axis
      this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = this.selectedUnit;

      // Append data from selected theme to the chart
      this.chartAppendData(this.auxSelectedParam);

      // add benchmark data to the plot if any
      this.benchMarkIndex = 0;
      this.appendBenchmarks(this.auxRelatedParam);

      setTimeout(() => {
        this.isLoading = false;
        this.chartReady = true;
      }, 150);
    }
  }
}
