import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { ChartDataSets, ChartOptions, ChartPluginsOptions } from "chart.js";
import { Color, BaseChartDirective, Label } from "ng2-charts";

// Data models
import { Parameter } from "../../../models/parameter.model";
import { ParamBenchmark } from "../../../models/parameter.model";

// Services
import { AcronymCatalogService } from "../../../services/acronym-catalog.service";
import { PalleteConstants } from "src/app/models/pallete.model";
import { ParameterService } from "src/app/services/parameter.service";

// Classes
import { UnitConverter } from "src/app/lib/unit-converter.component";
import { DataAnalytics } from "src/app/lib/data-analytics.component";
import { min } from "rxjs/operators";
import { ModelRunService } from "src/app/services/model-run.service";

/**
 * Shows a detailed information box about a specific parameter or model input.
 * Provides metadata and datasets in the form of tables and plots.
 */
@Component({
  selector: "app-input-detail",
  templateUrl: "./input-detail.component.html",
  styleUrls: ["./input-detail.component.css"],
})
export class InputDetailComponent implements OnInit {
  /** projection start date for x axis on charts */
  // private startDate;

  /** Parameter Object */
  @Input() public selectedParamater: Parameter;

  /** Language Index */
  public lanIndex = 0;

  /** Palette Dictionary */
  paletteDictionary: PalleteConstants;

  /** Data Analytics Library */
  analytics: DataAnalytics;

  /** Unit Conversion */
  private unitConverter: UnitConverter;

  /** Previous units before change */
  private oldUnits: string = null;

  /** Unit conversion options for this parameter */
  unitOptions: string[] = [];

  /** Benchmark index */
  private benchMarkIndex = 0;

  /** Acronym dictionary */
  private acronymDictionary: any = {};

  /** Visualization mode: table, slider, line or bar */
  mode = "field";

  /** Default Visualization Mode */
  defaultMode = "";

  /** flag that activates when widget is ready to visualize */
  widgetReady = false;

  /** flag that activates when acronym labels have been processed */
  labelsReady = false;

  /**  step resolution on slider widget */
  stepSize = 1;

  /** GridAPI object (data table) */
  private gridApi;

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
  /** Flag to show dataset legends */
  public lineChartLegend = true;
  /** The type of chart to be displayed (line or bar) */
  public lineChartType = "table";
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

  public lineChartPlugins: ChartPluginsOptions = {
    zoom: {
      pan: {
          enabled: true,
          mode: 'x',
          speed: 10,
          threshold: 10
      },
      zoom: {
          enabled: true,
          mode: 'y'
      }
   }
  }

  /** Plot dataset counter (lines added to the plot) */
  private lineCounter = 0;

  /** Moving Average List */
  movingAverages: any[] = [];

  /** Moving average timesteps */
  movingTimeSteps = 2;

  /** Access to the chart object */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /** Class contructor uses the acronym catalog service for labels */
  constructor(
    public acronymCatalogService: AcronymCatalogService,
    public parameterService: ParameterService,
    private modelRunService: ModelRunService
  ) {
    this.lanIndex = parameterService.lanIndex;
  }

  /*************************************
   * INICIALIZATION METHODS
   *************************************/

  /**
   * Component initialization method
   */
  ngOnInit() {
    // load projection start date
    // this.startDate = this.modelRunService.getProjectionStartInner();

    // Load plot pallete dictionary
    this.paletteDictionary = new PalleteConstants();

    // Load Data Analycs Library
    this.analytics = new DataAnalytics();

    // Load acronym dictionary
    this.acronymDictionary = this.acronymCatalogService.getAcronymDictionary();

    // Load unit conversion class
    this.unitConverter = new UnitConverter();

    // Set conversion language
    this.unitConverter.setLanguage(this.parameterService.locale.toLowerCase());

    // load the old units variable
    this.oldUnits = this.selectedParamater.paraminfo[this.lanIndex].paramUnit;

    // load the convertion options for this parameter
    this.unitOptions = this.unitConverter.GetConversionOptions(this.oldUnits);

    if (this.selectedParamater.structType !== "scalar") {
      // set table mode by start
      this.mode = "table";

      // append data from selected parameter to the table widget
      // this.tableAppendDataset(); deprecated
      this.tableAppendDatasets(this.selectedParamater);

      // append data from the selected parameter to the plot widget
      this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString =
        this.selectedParamater.paraminfo[this.lanIndex].paramUnit;
      this.lineChartOptions.title.text =
        this.selectedParamater.paraminfo[this.lanIndex].paramLabel;
      this.lineChartOptions.title.display = true;
      this.chartAppendInput(this.selectedParamater);
    } else if (this.selectedParamater.definitionType === "user") {
      this.mode = "slider";
    }

    if (typeof this.selectedParamater.widget !== "undefined") {
      this.mode = this.selectedParamater.widget;
    }

    switch (this.mode) {
      case "slider": {
        this.initSliders();
        break;
      }
      default:
        this.widgetReady = true;
        break;
    }

    this.defaultMode = this.mode;
  }

  /**
   * Initializes slider visualization
   */
  initSliders() {
    this.widgetReady = false;

    if (this.selectedParamater.stepSize !== null) {
      this.stepSize = this.selectedParamater.stepSize;
    }

    if (Array.isArray(this.selectedParamater.paramValue)) {
      this.mode = "multiple-slider";
    }

    this.widgetReady = true;
  }

  /*************************************
   * METHODS
   *************************************/

  /**
   * Append datasets contained in a model input to the ng-table widgets
   * @param modelInput model input to append
   */
  tableAppendDatasets(modelInput: Parameter) {
    if (modelInput.paramValue.length > 0) {
      const firstObject = modelInput.paramValue[0];

      // assign a column for each key on the json object
      for (const key in firstObject) {
        if (key !== null) {
          const columnDef = {
            headerName: key,
            field: key,
            editable: false,
            resizable: true,
          };
          // if the value is user changeable make the cell editable
          if (key === "value") {
            columnDef.headerName =
              modelInput.paramName +
              " (" +
              modelInput.paraminfo[this.lanIndex].paramUnit +
              ")";
            if (modelInput.definitionType === "user") {
              columnDef.editable = true;
            }
          }
          this.columnDefs.push(columnDef);
        }
      }
      this.rowData = modelInput.paramValue;
    }
  }

  /**
   * Append benchmark value to chart
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
      ).pattern,
    };

    this.lineChartData.push(ds);
    this.benchMarkIndex++;
  }

  /**
   * Appends datasets of a SWIM input to the chartJS object
   * @param modelInput SWIM model input object
   */
  private chartAppendInput(modelInput: Parameter) {
    const dimensionIndexes: string[] = []; // index labels
    const values = {}; // extracted values
    const datasetNames: string[] = []; // legends
    let isTimeseries = false; // flag for time series data containing 't' index
    const startIndex = this.lineChartData.length;

    // get dimension indexes (if any) - the t index is reserved for timeseries year
    for (const key in modelInput.paramValue[0]) {
      if (key !== null && key !== "value" && key !== "t") {
        dimensionIndexes.push(key); // push a legend name
      } else if (key === "t") {
        isTimeseries = true;
      }
    }

    // data structure transformation
    for (let i = 0; i < modelInput.paramValue.length; i++) {
      let index: any;
      let datasetName = "";

      // x axis label index if the dataset includes year on t index
      if (isTimeseries) {
        index = +modelInput.paramValue[i].t;
        if (dimensionIndexes.length === 0) {
          datasetName = modelInput.paramName;
        }
      } else {
        index = i.toString();
        datasetName = modelInput.paramName;
        if (dimensionIndexes.length > 0) {
          this.lineChartType = "bar";
          datasetName = "";
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
        let legend = modelInput.paramValue[i][dimensionIndexes[j]];
        if (legend in this.acronymDictionary.dictionary) {
          legend = this.acronymDictionary.dictionary[legend];
        }
        datasetName += legend + "-";
      }

      // remove the last dash character
      if (datasetName.lastIndexOf("-") === datasetName.length - 1) {
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
        modelInput.paramValue[i].value
      );

      // prepare line chart data
      for (let n = 0; n < datasetNames.length; n++) {
        const colorIndex = this.lineCounter + n;
        const ds = {
          label: datasetNames[n],
          data: values[n],
          hidden: false,
          fill: false,
          borderColor:
            this.paletteDictionary.getLinePallete(colorIndex).colorRGB,
          backgroundColor:
            this.paletteDictionary.getLinePallete(colorIndex).colorRGB,
          borderDash: this.paletteDictionary.getLinePallete(colorIndex).pattern,
          pointBackgroundColor:
            this.paletteDictionary.getLinePallete(colorIndex).colorRGB,
        };

        this.lineChartData[startIndex + n] = ds;
      }
    }

    // counter to keep all line colors different
    this.lineCounter += datasetNames.length;
  }

  /**
   * Calls append benchmark data only if it has been defined on the parameter object.
   */
  private appendBenchmarks() {
    try {
      if (typeof this.selectedParamater.paramBenchMarks === "undefined") {
        return;
      }
      if (this.selectedParamater.paramBenchMarks !== null) {
        for (const benchmark of this.selectedParamater.paramBenchMarks) {
          // add benchmarks for the current target language
          if (
            benchmark.benchmarkLang ===
            this.parameterService.locale.toLocaleLowerCase()
          ) {
            this.chartAppendBenchmarkData(benchmark);
          }
        }
      }
    } catch (error) {
      console.log("Error appendBenchmarks: " + error);
    }
  }

  /**
   *  Calculate and append moving averages on selected data sets.
   */
  public setMovingAverages() {
    if (this.movingAverages.length > 0) {
      // console.log(this.movingAverages);
      // console.log(this.movingTimeSteps);

      // iterate each dataset
      for (const dataset of this.movingAverages) {
        const smaSet = this.analytics.SMA(dataset.data, this.movingTimeSteps);
        // console.log(smaSet);
        const inputDataset: Parameter = {
          modelID: this.selectedParamater.modelID,
          dataType: this.selectedParamater.dataType,
          paramName: dataset.label + " " + "SMA" + "-" + this.movingTimeSteps,
          maxValue: 0,
          minValue: 0,
          definitionType: this.selectedParamater.definitionType,
          paramDefaultSource: "SMA Calculation",
          structType: "matrix",
          paraminfo: null,
          paramDefaultValue: null,
          paramValue: [],
        };

        // matrix with no defined x axis labels on time
        if (this.selectedParamater.structType === "matrix") {
          for (const val of smaSet) {
            inputDataset.paramValue.push({ value: val });
          }
        }

        // if the timeseries years are defined on the table with 't' key
        if (
          this.selectedParamater.structType === "table" &&
          this.selectedParamater.paramValue[0].hasOwnProperty("t")
        ) {
          let i = 0;
          for (const val of smaSet) {
            inputDataset.paramValue.push({
              t: this.selectedParamater.paramValue[i].t,
              value: val,
            });
            i++;
          }
        }

        this.chartAppendInput(inputDataset);
      }
    }
  }

  /**
   * Translates a set name to its corresponding acronym meaning
   * @param obj paramValue object
   */
  generateLabel(obj: any) {
    let datasetName = "";

    // get dimension indexes if any - the t index is reserved for timeseries year
    for (const key in obj) {
      if (key !== null && key !== "value" && key !== "t") {
        let legend = obj[key];
        if (legend in this.acronymDictionary.dictionary) {
          legend = this.acronymDictionary.dictionary[legend];
        }
        datasetName += legend + "-";
      }
    }

    // remove the last dash character
    if (datasetName.lastIndexOf("-") === datasetName.length - 1) {
      datasetName = datasetName.slice(0, -1);
    }

    return datasetName;
  }

  /*************************************
   * EVENT HANDLERS
   *************************************/

  onSelectUnit() {
    // units target
    const unitTarget =
      this.selectedParamater.paraminfo[this.lanIndex].paramUnit;
    console.log("Converting from: " + this.oldUnits + " to: " + unitTarget);

    // current viz mode
    const currentMode = this.mode;

    if (this.selectedParamater.structType === "scalar") {
      const scalarValue = this.unitConverter.Convert(
        this.oldUnits,
        unitTarget,
        this.selectedParamater.paramValue
      );
      const defaultScaralValue = this.unitConverter.Convert(
        this.oldUnits,
        unitTarget,
        this.selectedParamater.paramDefaultValue
      );
      if (scalarValue !== null) {
        this.selectedParamater.paramValue = scalarValue; // sets converted value on acting values
        this.selectedParamater.paramDefaultValue = defaultScaralValue; // sets converted values on defaults
      } else {
        // conversion failed here and returned null, reset to old units and return
        this.selectedParamater.paraminfo[this.lanIndex].paramUnit =
          this.oldUnits;
        console.log("Conversion returned null");
        return;
      }
    } else {
      // the unit conversion for the parameter values
      for (const v in this.selectedParamater.paramValue) {
        if (v !== null) {
          const val = this.unitConverter.Convert(
            this.oldUnits,
            unitTarget,
            this.selectedParamater.paramValue[v].value
          );
          const defaultVal = this.unitConverter.Convert(
            this.oldUnits,
            unitTarget,
            this.selectedParamater.paramDefaultValue[v].value
          );
          if (val !== null && defaultVal !== null) {
            this.selectedParamater.paramValue[v].value = val;
            this.selectedParamater.paramDefaultValue[v].value = defaultVal;
          } else {
            // conversion failed here and returned null, reset to old units and return
            this.selectedParamater.paraminfo[this.lanIndex].paramUnit =
              this.oldUnits;
            console.log("Conversion returned null");
            return;
          }
        }
      }
    }

    // convert the upper bound
    this.selectedParamater.maxValue = this.unitConverter.Convert(
      this.oldUnits,
      unitTarget,
      this.selectedParamater.maxValue
    );

    // convert the lower bound
    this.selectedParamater.minValue = this.unitConverter.Convert(
      this.oldUnits,
      unitTarget,
      this.selectedParamater.minValue
    );

    // the unit conversion for the parameter benchamrks
    for (const bIndex in this.selectedParamater.paramBenchMarks) {
      if (bIndex !== null) {
        this.selectedParamater.paramBenchMarks[bIndex].benchmarkValue =
          this.unitConverter.Convert(
            this.oldUnits,
            unitTarget,
            this.selectedParamater.paramBenchMarks[bIndex].benchmarkValue
          );
      }
    }

    // update the unit conversion options
    this.unitOptions = this.unitConverter.GetConversionOptions(unitTarget);

    /*** Redraw Widgets */

    // hide the visualization widgets
    this.mode = "";

    // cholo mode clean the table
    this.rowData = [];
    this.columnDefs = [];

    // cholo mode clean graph
    this.lineChartData = [];
    this.lineChartLabels = [];

    // add selected input to table again
    this.tableAppendDatasets(this.selectedParamater);

    // extract the parameter units and add label to y-axis
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = unitTarget;

    // append converted data
    this.chartAppendInput(this.selectedParamater);

    // add benchmark data to the plot if any
    this.benchMarkIndex = 0;
    this.appendBenchmarks();

    setTimeout(() => {
      this.mode = currentMode;
    }, 150);

    this.oldUnits = unitTarget;
  }

  onZoomIn() {
    // hide the visualization widgets
    console.log("Before: " + this.chart.chart.canvas.width);
    this.chart.chart.canvas.width -= 100;
    this.chart.chart.canvas.height -= 100;
    console.log("After: " + this.chart.chart.canvas.width);
    setTimeout(() => {
      this.chart.chart.update();
    }, 100);
  }

  onZoomOut() {
    console.log("Before: " + this.chart.chart.canvas.width);
    this.chart.chart.canvas.width += 100;
    this.chart.chart.canvas.height += 100;
    console.log("After: " + this.chart.chart.canvas.width);
    setTimeout(() => {
      this.chart.chart.update();
    }, 100);
  }

  /**
   *  Export parameter data to csv format.
   *  Note: does not work on iPad ios
   */
  onBtnExport() {
    console.log("Exporting CSV file");
    const params = {
      skipHeader: false,
      allColumns: true,
      fileName: this.selectedParamater.paramName + ".csv",
    };

    this.gridApi.exportDataAsCsv(params);
  }

  /**
   * Imports only parameter values of the selected input from CSV file
   */
  onImportCSV() {
    console.log("Importing CSV file");
  }

  /**
   * Assignment of the gridAPI
   * @param params generated grid parameters
   */
  onGridReady(params) {
    this.gridApi = params.api;
  }

  /**
   * Switches to a different data visualization view.
   * @param vizMode Visualization modes: table, line chart or bar chart
   */
  onVizChange(vizMode: string) {
    this.mode = vizMode;

    if (vizMode === "line" || "bar") {
      this.lineChartType = vizMode;

      this.appendBenchmarks();
    }
  }

  /**
   * Resets parameter values back to the default
   */
  onResetValues() {
    // reset to default values (maybe split this function)
    this.selectedParamater.paramValue = JSON.parse(
      JSON.stringify(this.selectedParamater.paramDefaultValue)
    );

    // clear appended SMAs
    this.movingAverages = [];

    // clear and reload data table
    this.rowData = this.selectedParamater.paramValue;

    if (this.selectedParamater.dataType !== "scalar") {
      // cholo mode clean graph
      this.lineCounter = 0;

      this.lineChartData = [];
      this.lineChartLabels = [];

      // append converted data
      this.chartAppendInput(this.selectedParamater);

      // add benchmark data to the plot if any
      this.benchMarkIndex = 0;
      this.appendBenchmarks();
    }
  }

  /** Export image from plot canvas */
  onExportPlot() {
    let imageURL = this.chart.toBase64Image();
    imageURL = imageURL.replace(/^data:image\/[^;]+/, "data:image/png");
    window.open(imageURL);
  }

  /**
   * Handler: update plot data when table values change
   * @param event table change event
   */
  onCellValueChanged() {
    // reload the chart js plot with updated values

    // cholo mode clean graph
    this.lineChartData = [];
    this.lineChartLabels = [];

    // append converted data
    this.chartAppendInput(this.selectedParamater);

    // add benchmark data to the plot if any
    this.benchMarkIndex = 0;
    this.appendBenchmarks();
  }
} // END
