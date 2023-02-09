import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

// Data models
import { ModelOutput } from '../../../models/output.model';
import { VarBenchmark } from '../../../models/output.model';
import { PalleteConstants } from 'src/app/models/pallete.model';

// Services
import { AcronymCatalogService } from 'src/app/services/acronym-catalog.service';
import { ParameterService } from 'src/app/services/parameter.service';

// Classes
import { UnitConverter } from 'src/app/lib/unit-converter.component';
import { DataAnalytics } from 'src/app/lib/data-analytics.component';

/**
 * Box that contains detailed information of a model output when selected for comparison
 * with other model run scenarios. Includes output metadata and dataset views.
 */
@Component({
  selector: 'app-cross-compare',
  templateUrl: './cross-compare.component.html',
  styleUrls: [
    './cross-compare.component.css',
    '../output-detail/output-detail.component.css',
  ],
})
export class CrossCompareComponent implements OnInit {

  /** Output selected to compare against */
  @Input() compareOutput: any;

  /** Simulation start date to use on timeseries */
  private startDate: string;

  /** Language Index */
  public lanIndex = 0;

  /** Palette Dictionary */
  paletteDictionary: PalleteConstants;

  /** Unit Conversion */
  private unitConverter: UnitConverter;

  /** Previous units before change */
  private oldUnits: string = null;

  /** Unit conversion options for this output */
  unitOptions: string[] = [];

  /** Benchmark index */
  private benchMarkIndex = 0;

  /** Plot dataset counter (lines added to the plot) */
  private lineCounter = 0;

  /** Acronym dictionary */
  private acronymDictionary: any = {};

  /** Data Analytics Library */
  analytics: DataAnalytics;

  /** Moving Average List */
  movingAverages: any[] = [];

  /** Moving average timesteps */
  movingTimeSteps = 2;

  /** Visualization mode: table, line or bar */
  mode = 'line';

  /** GridAPI object (data table) */
  private gridApi;

  /** Access to the columns on datagrid */
  private gridColumnApi;

  /** Data loaded per row */
  rowData: any[] = [];

  /** Column definitions */
  columnDefs: any[] = [];

  /** ChartJS appended datasets */
  public lineChartData: ChartDataSets[] = [];
  /** ChartJS Label list */
  public lineChartLabels: Label[] = [];
  /** Flag to reverse the Y axis order (flip the chart) */
  public reverse = false;
  /** ChartJS color list */
  public lineChartColors: Color[] = [];
  /** Flasg to show dataset legends */
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
            reverse: this.reverse,
          },
          scaleLabel: {
            display: true,
            labelString: null,
          },
        },
      ],
    },
    hover: { mode: null },
    title: {
      display: false,
      text: null,
      fontSize: 16,
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  };

  /** Access to the chart object on the view */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  constructor(
    public acronymCatalogService: AcronymCatalogService,
    public parameterService: ParameterService
  ) {
    this.lanIndex = parameterService.lanIndex;
  }

  ngOnInit() {

    // set projection start year if available
    if (typeof this.compareOutput.scenarioStartProjection !== 'undefined') {
      this.startDate = this.compareOutput.scenarioStartProjection;
    }

    // Load plot pallete dictionary
    this.paletteDictionary = new PalleteConstants();

    // Load Data Analytics Library
    this.analytics = new DataAnalytics();

    // Load acronym dictionary
    this.acronymDictionary = this.acronymCatalogService.getAcronymDictionary();

    // Load unit conversion class
    this.unitConverter = new UnitConverter();

    // Set unit converter language
    this.unitConverter.setLanguage(this.parameterService.locale.toLowerCase());

    // Load the old units variable
    this.oldUnits = this.compareOutput.output.varinfo[this.lanIndex].varUnit;

    // Load the convertion options for this output
    this.unitOptions = this.unitConverter.GetConversionOptions(this.oldUnits);

    // append the selected dataset to the table view
    this.tableAppendDataset(this.compareOutput.output);

    // append the selected dataset to the chart view
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = this.compareOutput.output.varinfo[this.lanIndex].varUnit;
    this.lineChartOptions.title.text = this.compareOutput.output.varinfo[this.lanIndex].varLabel;
    this.lineChartOptions.title.display = true;
    this.chartAppendOutputData(this.compareOutput.output);

    // Line plot view loads initially
    this.onVizChange('line');
  }

  /**
   * Appends a multidimension data set to the table visualization
   * @param dataSet  dataset to append
   */
  private tableAppendDataset(output: ModelOutput) {
    // TODO: ready to separate into base component
    const dataSet = output.varValue;

    if (dataSet.length > 0) {
      const firstObject = dataSet[0];
      // console.log(firstObject);

      // assign a column for each key on the json object
      for (const key in firstObject) {
        if (key !== null) {
          const columnDef = {
            headerName: key,
            field: output.varName + '-' + key,
            editable: false,
          };

          // if the value is user changeable make the cell editable
          if (key === 'value') {
            columnDef.headerName =
              output.varName +
              ' (' +
              output.varinfo[this.lanIndex].varUnit +
              ')';
          }
          this.columnDefs.push(columnDef);
        }
      }

      // push each set to the table
      let i = 0;
      for (let set of output.varValue) {
        set = this.renameKeys(output.varName, set);
        // combine current row object with the incoming set object
        this.rowData[i] = { ...set, ...this.rowData[i] };
        i++;
      }
    }
  }

  /**
   * Append model output benchmark data
   */
  private appendBenchmarks() {
    // TODO: needs refactor for base component separation?
    this.benchMarkIndex = 0;

    try {
      if (typeof this.compareOutput.output.varBenchMarks === 'undefined') {
        return;
      } else if (this.compareOutput.output.varBenchMarks !== null) {
        for (const benchmark of this.compareOutput.output.varBenchMarks) {
          if (benchmark.benchmarkLang === this.parameterService.locale.toLocaleLowerCase()) {
            this.chartAppendBenchmarkData(benchmark);
          }
        }
      }
    } catch (error) {
      console.log('Error appendBenchmarks: ' + error);
    }
  }

  /**
   * Append benchmark value to chart
   * @param benchmark benchmark object to append
   */
  private chartAppendBenchmarkData(benchmark: VarBenchmark) {
    // TODO: ready to refactor into base component
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
      radius: 0, // removes data dots on chart
      data: values,
      hidden: false,
      fill: false,
      borderColor: this.paletteDictionary.getBenchmarkPallete(this.benchMarkIndex).colorRGB,
      backgroundColor: this.paletteDictionary.getBenchmarkPallete(this.benchMarkIndex).colorRGB,
      borderDash: this.paletteDictionary.getBenchmarkPallete(this.benchMarkIndex).pattern,
    };

    this.lineChartData.push(ds);
    this.benchMarkIndex++;

  }

  /**
   * Assignment of the gridAPI
   * @param params generated grid parameters
   */
  onGridReady(params) {
    // TODO: separate into base component
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  /**
   * Appends a set of output data to the chartjs visualization
   * @param outputSet selected data set to append
   */
  private chartAppendOutputData(outputSet: ModelOutput) {
    // variable declaration
    const dimensionIndexes: string[] = []; // table dimension
    const values = {};
    const datasetNames: string[] = [];
    let isTimeseries = false;
    const startIndex = this.lineChartData.length;

    // get dimension indexes if any - the t index is reserved for timeseries year
    for (const key in outputSet.varValue[0]) {
      if (key !== null && key !== 'value' && key !== 't') {
        dimensionIndexes.push(key);
      } else if (key === 't') {
        isTimeseries = true;
      }
    }

    // data structure transformation
    for (let i = 0; i < outputSet.varValue.length; i++) {
      let index: any;
      let datasetName = ''; // TBD

      // x axis label index if the dataset includes year on t index
      if (isTimeseries) {
        index = +outputSet.varValue[i].t;
      } else {
        if (typeof this.startDate === 'undefined') {
          index = i.toString();
        } else {
          index = +this.startDate + i;
        }
        datasetName = outputSet.varName;
        if (datasetName in this.acronymDictionary.dictionary) {
          datasetName = this.acronymDictionary.dictionary[datasetName];
        }
      }

      // concatenate each set for a dataset name
      for (let j = 0; j < dimensionIndexes.length; j++) {
        let legend = outputSet.varValue[i][dimensionIndexes[j]];
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
        outputSet.varValue[i].value
      );

      // prepare line chart data
      for (let n = 0; n < datasetNames.length; n++) {
        const colorIndex = this.lineCounter + n;
        const ds = {
          label: datasetNames[n],
          data: values[n],
          hidden: false,
          fill: false,
          borderColor: this.paletteDictionary.getLinePallete(colorIndex)
            .colorRGB,
          backgroundColor: this.paletteDictionary.getLinePallete(colorIndex)
            .colorRGB,
          borderDash: this.paletteDictionary.getLinePallete(colorIndex).pattern,
          pointBackgroundColor: this.paletteDictionary.getLinePallete(
            colorIndex
          ).colorRGB,
        };

        this.lineChartData[startIndex + n] = ds;
      }
    }

    // counter to keep all line colors different
    this.lineCounter += datasetNames.length;
  }

  /**
   * Unit conversion for model output datasets
   * @param modelOutput model output to convert
   * @param sourceUnits name of the source units
   * @param targetUnits name of the target units
   */
  private changeOutputUnits(
    modelOutput: ModelOutput,
    sourceUnits: string,
    targetUnits: string
  ) {
    // the unit conversion for the output values
    for (const v in modelOutput.varValue) {
      if (v !== null) {
        const val = this.unitConverter.Convert(
          sourceUnits,
          targetUnits,
          modelOutput.varValue[v].value
        );
        if (val !== null) {
          modelOutput.varValue[v].value = val;
        } else {
          console.log('Conversion returned null');
          return;
        }
      }
    }

    // very important to change the unit metadata of the changed dataset
    modelOutput.varinfo[this.lanIndex].varUnit = targetUnits;
  }

  /**
   * Performs unit convesions over all loaded inputs and outputs with visualization update
   */
  onSelectUnit() {
    // units target
    const unitTarget = this.compareOutput.output.varinfo[this.lanIndex].varUnit;
    console.log('Converting from: ' + this.oldUnits + ' to: ' + unitTarget);

    // current visualization mode so we can return to it after conversion
    const currentMode = this.mode;

    // update the unit conversion options
    this.unitOptions = this.unitConverter.GetConversionOptions(unitTarget);

    // unit conversion for these outputs
    this.changeOutputUnits(
      this.compareOutput.output,
      this.oldUnits,
      unitTarget
    );

    // the unit conversion for the parameter benchamrks
    for (const bIndex in this.compareOutput.output.varBenchMarks) {
      if (bIndex !== null) {
        this.compareOutput.output.varBenchMarks[
          bIndex
        ].benchmarkValue = this.unitConverter.Convert(
          this.oldUnits,
          unitTarget,
          this.compareOutput.output.varBenchMarks[bIndex].benchmarkValue
        );
      }
    }

    /*** Redraw Widgets */

    // hide the visualization widgets
    this.mode = '';

    // extract the parameter units and add label to y-axis
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = unitTarget;

    // Clean all visualization widgets and re-add data
    this.onSetSelected();

    // append benchmarks if any are available
    if (currentMode === 'line') {
      this.appendBenchmarks();
    }

    setTimeout(() => {
      this.mode = currentMode;
    }, 150);

    this.oldUnits = unitTarget;
  }

  /**
   *  Calculate and append moving averages on selected data sets.
   */
  public setMovingAverages() {

    if (this.movingAverages.length > 0) {

      // iterate each dataset
      for (const dataset of this.movingAverages) {
        // console.log(dataset.data);
        const smaSet = this.analytics.SMA(dataset.data, this.movingTimeSteps);
        // console.log(smaSet);
        const outputDataset: ModelOutput = {
          modelID : this.compareOutput.output.modelID,
          varName : dataset.label + ' ' + 'SMA' + '-' + this.movingTimeSteps,
          varinfo : null,
          varValue : []
        };

        // if the timeseries years are defined on the table with 't' key
        if (this.compareOutput.output.varValue[0].hasOwnProperty('t')) {
          let i = 0;
          for (const val of smaSet) {
            outputDataset.varValue.push({t: this.compareOutput.output.varValue[i].t, value : val});
            i++;
          }
        } else {
          for (const val of smaSet) {
            outputDataset.varValue.push({ value : val });
          }
        }

        this.chartAppendOutputData(outputDataset);
      }
    }
  }

  /************************
   * Event Handlers
   * *********************/

  /**
   *  Export parameter data to csv format.
   *  Note: does not work on iPad ios
   */
  onBtnExport() {
    // TODO: prep for base class
    const params = {
      skipHeader: false,
      allColumns: true,
      fileName: this.compareOutput.output.varName + '.csv'
    };

    try {
      this.gridApi.exportDataAsCsv(params);
    } catch (error) {
      console.log('Error Export Data: ' + error);
    }
  }

  /**
   * Sets appended datasets on visualization tables and plots
   */
  onSetSelected() {

    // cholo mode clean the table
    this.rowData = [];
    this.columnDefs = [];

    // cholo mode clean graph
    this.lineChartData = [];
    this.lineChartLabels = [];
    this.lineCounter = 0;

    // cholo mode clear benchmark index
    this.benchMarkIndex = 0;

    // add selected output to table again
    this.tableAppendDataset(this.compareOutput.output);

    // add selected output to table again
    this.chartAppendOutputData(this.compareOutput.output);
  }


  /**
   * Switches to a different data visualization view.
   * @param vizMode Visualization modes: table, line chart or bar chart
   */
  onVizChange(vizMode: string) {
    // switch visualization mode
    this.mode = vizMode;

    // if plot visualization selected
    if (vizMode === 'line' || 'bar') {
      // change line chart type to user selected
      this.lineChartType = vizMode;

      // append benchmarks if any are available
      if (vizMode === 'line') {
        this.appendBenchmarks();
      }
    }
  }


  /**
   * Reverses the y axis of the chart js plot
   */
  onPlotReverse() {
    this.reverse = !this.reverse;
    const wasMode = this.mode;
    this.lineChartOptions.scales.yAxes[0].ticks.reverse = this.reverse;
    this.mode = '';
    setTimeout(() => {
      this.onVizChange(wasMode);
    }, 100);
  }

  /**
   * Resets parameter values back to the default
   */
  onResetValues() {
    // clear appended SMAs
    this.movingAverages = [];

    // clear table data and redraw selected output
    this.rowData = [];
    this.columnDefs = [];
    this.tableAppendDataset(this.compareOutput.output);

    // clear plot data and redraw selected output
    if (this.compareOutput.output.varValue.length > 0) {
      // cholo mode clean graph
      this.lineCounter = 0;
      this.lineChartData = [];
      this.lineChartLabels = [];

      // append converted data
      this.chartAppendOutputData(this.compareOutput.output);

      // add benchmark data to the plot if any
      this.benchMarkIndex = 0;
      this.appendBenchmarks();
    }
  }

  /************************
   * Helper Methods
   * *********************/

  /**
   * renames the keys of a json object by adding a prefix behind it
   * @param prefix string prefix
   * @param obj object that will be manipulated
   */
  private renameKeys = (prefix: string, obj) => {
    // TODO: separate into base component
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = prefix + '-' + key;
      const renamedObject = {
        [newKey]: obj[key],
      };

      return {
        ...acc,
        ...renamedObject,
      };
    }, {});
  };
}
