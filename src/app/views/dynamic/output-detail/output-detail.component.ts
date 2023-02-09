import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { ChartDataSets, ChartOptions } from "chart.js";
import { Color, BaseChartDirective, Label } from "ng2-charts";

// Data models
import { ModelOutput } from "../../../models/output.model";
import { VarBenchmark } from "../../../models/output.model";
import { Parameter } from "../../../models/parameter.model";
import { PalleteConstants } from "src/app/models/pallete.model";
import { Request } from "src/app/modules/nlng/request.model";
import { ModelOutput as SWIMOutput } from "src/app/modules/nlng/modeloutput.model";

// Services
import { ModelRunService } from "../../../services/model-run.service";
import { AcronymCatalogService } from "../../../services/acronym-catalog.service";
import { RecommenderService } from "../../../services/recommender.service";
import { ParameterService } from "src/app/services/parameter.service";
import { NlngService } from "src/app/modules/nlng/nlng.service";

// Classes
import { UnitConverter } from "src/app/lib/unit-converter.component";
import { DataAnalytics } from "src/app/lib/data-analytics.component";

/**
 * Box that contains detailed information of a model output.
 * It includes output metadata an datasets in the forms of tables and plots.
 */
@Component({
  selector: "app-output-detail",
  templateUrl: "./output-detail.component.html",
  styleUrls: ["./output-detail.component.css"],
})
export class OutputDetailComponent implements OnInit {
  /** Model Output Object */
  @Input() selectedOutput: ModelOutput;

  /** Simulation start date to use on timeseries */
  @Input() startDate: string;

  /* Narrative string */
  public narrative = "";

  /** Hide Tools Flag */
  public hideTools = false;

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

  /** Unit conversion options for this output */
  unitOptions: string[] = [];

  /** Benchmark index */
  private benchMarkIndex = 0;
  private dataIndex = 0;

  /** Plot dataset counter (lines added to the plot) */
  private lineCounter = 0;

  /** Visualization mode: table, line or bar */
  mode = "line";

  /** Acronym dictionary */
  private acronymDictionary: any = {};

  /** GridAPI object (data table) */
  private gridApi;

  /** Access to the columns on datagrid */
  private gridColumnApi;

  /** Data loaded per row */
  rowData: any[] = [];

  /** Column definitions */
  columnDefs: any[] = [];

  /** Appendable output datasets with same units */
  appendableOutputSets: ModelOutput[] = [];

  /** Currently appended output datasets */
  appendedOutputSets: ModelOutput[] = [];

  /** Appendable input datasets with same units */
  appendableInputSets: Parameter[] = [];

  /** Currently appended input datasets */
  appendedInputSets: Parameter[] = [];

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
  public lineChartType = "line";
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
        borderWidth: 2,
      },
      point: {
        radius: 4,
      },
    },
  };

  /** Moving Average List */
  movingAverages: any[] = [];

  /** Moving average timesteps */
  movingTimeSteps = 2;

  /** Access to the Chart object on the view */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /** Class constructor.
   *  Uses ModelRunService, AcronymCatalog and Recommender Service
   */
  constructor(
    public modelRunService: ModelRunService,
    public acronymCatalogService: AcronymCatalogService,
    public recommenderService: RecommenderService,
    public parameterService: ParameterService,
    private NlngService: NlngService
  )
  {
    this.lanIndex = parameterService.lanIndex;
  }

  /**
   * Component initialization method.
   * Sets the default visualization mode to table view.
   * Loads appendable datasets to the currently selected dataset.
   * Initializes table and plot with data from the selected output.
   */
  ngOnInit() {

    /** Load plot pallete dictionary */
    this.paletteDictionary = new PalleteConstants();

    // Load Data Analycs Library
    this.analytics = new DataAnalytics();

    // const scenarioID = this.modelRunService.getScenarioID();
    // const modelID = this.modelRunService.getModelID();
    this.hideTools = this.modelRunService.getToolStatus();

    // Load acronym dictionary
    this.acronymDictionary = this.acronymCatalogService.getAcronymDictionary();

    // Load unit conversion class
    this.unitConverter = new UnitConverter();

    // Set unit converter language
    this.unitConverter.setLanguage(this.parameterService.locale.toLowerCase());

    // Load the old units variable
    this.oldUnits = this.selectedOutput.varinfo[this.lanIndex].varUnit;

    // Load the convertion options for this output
    this.unitOptions = this.unitConverter.GetConversionOptions(this.oldUnits);

    // load output datasets that can be appended to this view
    this.loadAppendableDataSets();

    // load input datasets that can be appended to this view
    this.loadAppendableInputDataSets();

    // append the selected dataset to the table view
    this.tableAppendDataset(this.selectedOutput);

    // append the selected dataset to the chart view
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString =
      this.selectedOutput.varinfo[this.lanIndex].varUnit;
    this.lineChartOptions.title.text =
      this.selectedOutput.varinfo[this.lanIndex].varLabel;
    this.lineChartOptions.title.display = true;
    this.chartAppendOutputData(this.selectedOutput);

    // Line plot view loads initially
    this.onVizChange("line");

    // Load narratives
    this.requestNarrative();

    // Log implicit feedback as output was selected to visualize
    this.recommenderService.logImplicitFeedback(
      this.selectedOutput.varName,
      this.modelRunService.getScenarioID(),
      this.modelRunService.getUserRole()
    );

  }

  /*****************************
   * Inicialization Methods
   ****************************/

  /**
   * Loads the listing of output variables that can be appended to the visualization of the selected output.
   * The list will load outputs with the same units excluding the one currently in use.
   */
  private loadAppendableDataSets() {
    this.appendableOutputSets = this.modelRunService.getAppendableList(
      this.selectedOutput.varinfo[this.lanIndex].varUnit,
      this.selectedOutput.varName
    );
  }

  /**
   * Loads the listing of input parameters that can be appended to the visualization of the selted output.
   */
  private loadAppendableInputDataSets() {
    this.appendableInputSets = this.modelRunService.getAppendableInputList(
      this.selectedOutput.varinfo[this.lanIndex].varUnit
    );
  }

  /******************************
   * Narrative Methods
   * ****************************/
  private requestNarrative() {
    let swimOutput: SWIMOutput = {
      modelID: this.selectedOutput.modelID,
      varinfo: this.selectedOutput.varinfo,
      varName: this.selectedOutput.varName,
      varValue: this.selectedOutput.varValue,
    } as SWIMOutput;

    // if the output contains benchmarks append it to the output object
    if (this.selectedOutput.varBenchMarks !== null && this.selectedOutput.varBenchMarks !== undefined){
      swimOutput.varBenchMarks = this.selectedOutput.varBenchMarks;
    }

    let reqPayload: Request = {
      scenarioid: this.modelRunService.getScenarioID(),
      language: this.parameterService.locale.toLowerCase(),
      role: this.modelRunService.getUserRole(),
      output: swimOutput,
    } as Request;

    this.NlngService.getOutputNarratives(reqPayload).subscribe(
      (response) => {
        this.narrative = response.result;
      },
      (error) => {
        //TODO: Log this error to database
        console.log('Error: Narrative could not be generated.');
      }
    );
  }

  /************************
   * General Methods
   * *********************/

  /**
   * Appends a multidimension data set to the table visualization
   * @param dataSet  dataset to append
   */
  private tableAppendDataset(output: ModelOutput) {
    const dataSet = output.varValue;

    if (dataSet.length > 0) {
      const firstObject = dataSet[0];
      // console.log(firstObject);

      // assign a column for each key on the json object
      for (const key in firstObject) {
        if (key !== null) {
          const columnDef = {
            headerName: key,
            field: output.varName + "-" + key,
            editable: false,
          };

          // if the value is user changeable make the cell editable
          if (key === "value") {
            columnDef.headerName =
              output.varName +
              " (" +
              output.varinfo[this.lanIndex].varUnit +
              ")";
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
   * Appends multidimension input dataset into the table visualization
   * @param input input parameter to append
   */
  private tableAppendInputDataset(input: Parameter) {
    const dataSet = input.paramValue;

    if (dataSet.length > 0) {
      const firstObject = dataSet[0];

      // assign a column for each key on the json object
      for (const key in firstObject) {
        if (key !== null) {
          const columnDef = {
            headerName: key,
            field: input.paramName + "-" + key,
            editable: false,
          };

          // if the value is user changeable make the cell editable
          if (key === "value") {
            columnDef.headerName =
              input.paramName + " (" + input.paraminfo[0].paramUnit + ")";
          }
          this.columnDefs.push(columnDef);
        }
      }

      // push each set to the table
      let i = 0;
      for (let set of input.paramValue) {
        set = this.renameKeys(input.paramName, set);
        // combine current row object with the incoming set object
        this.rowData[i] = { ...set, ...this.rowData[i] };
        i++;
      }
    }
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
      if (key !== null && key !== "value" && key !== "t") {
        dimensionIndexes.push(key);
      } else if (key === "t") {
        isTimeseries = true;
      }
    }

    // data structure transformation
    for (let i = 0; i < outputSet.varValue.length; i++) {
      let index: any;
      let datasetName = ""; // TBD

      // x axis label index if the dataset includes year on t index
      if (isTimeseries) {
        index = +outputSet.varValue[i].t;
      } else {
        if (typeof this.startDate === "undefined") {
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
        datasetName += legend + "-";
      }

      // set dataset name if in the acronym dictionary and empty up to this point
      if (datasetName == "") {
        datasetName = outputSet.varName;
        if (datasetName in this.acronymDictionary.dictionary) {
          datasetName = this.acronymDictionary.dictionary[datasetName];
        }
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
   * Append input datasets to the chart JS visualization
   */
  private chartAppendInputData(inputSet: Parameter) {
    // variable declaration
    const dimensionIndexes: string[] = []; // table dimension
    const values = {};
    const datasetNames: string[] = [];
    let isTimeseries = false;
    const startIndex = this.lineChartData.length;

    // get dimension indexes if any - the t index is reserved for timeseries year
    for (const key in inputSet.paramValue[0]) {
      if (key !== null && key !== "value" && key !== "t") {
        dimensionIndexes.push(key);
      } else if (key === "t") {
        isTimeseries = true;
      }
    }

    // data structure transformation
    for (let i = 0; i < inputSet.paramValue.length; i++) {
      let index: any;
      let datasetName = ""; // TBD

      // x axis label index if the dataset includes year on t index
      if (isTimeseries) {
        index = "t";
      } else {
        if (typeof this.startDate === "undefined") {
          index = i.toString();
        } else {
          index = +this.startDate + i;
        }
        datasetName = inputSet.paramName;
        if (datasetName in this.acronymDictionary.dictionary) {
          datasetName = this.acronymDictionary.dictionary[datasetName];
        }
      }

      // concatenate each set for a dataset name
      for (let j = 0; j < dimensionIndexes.length; j++) {
        let legend = inputSet.paramValue[i][dimensionIndexes[j]];
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
        inputSet.paramValue[i].value
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
   * Append benchmark value to chart
   * @param benchmark benchmark object to append
   */
  private chartAppendBenchmarkData(benchmark: VarBenchmark) {
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
          console.log("Conversion returned null");
          return;
        }
      }
    }

    // very important to change the unit metadata of the changed dataset
    modelOutput.varinfo[this.lanIndex].varUnit = targetUnits;
  }

  /**
   * Unit conversion for model input datasets
   * @param modelInput model input to convert
   * @param sourceUnits name of the source units
   * @param targetUnits name of the target units
   */
  private changeInputUnits(
    modelInput: Parameter,
    sourceUnits: string,
    targetUnits: string
  ) {
    // the unit conversion for the output values
    for (const p in modelInput.paramValue) {
      if (p !== null) {
        const val = this.unitConverter.Convert(
          sourceUnits,
          targetUnits,
          modelInput.paramValue[p].value
        );
        if (val !== null) {
          modelInput.paramValue[p].value = val;
        } else {
          console.log("Conversion returned null");
          return;
        }
      }
    }

    // very important to change the unit metadata of the changed dataset
    modelInput.paraminfo[0].paramUnit = targetUnits;
  }

  /**
   * Append model output benchmark data
   */
  private appendBenchmarks() {
    // console.log(this.selectedOutput);
    this.benchMarkIndex = 0;

    try {
      if (typeof this.selectedOutput.varBenchMarks === "undefined") {
        return;
      } else if (this.selectedOutput.varBenchMarks !== null) {
        for (const benchmark of this.selectedOutput.varBenchMarks) {
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
      // iterate each dataset
      for (const dataset of this.movingAverages) {
        // console.log(dataset.data);
        const smaSet = this.analytics.SMA(dataset.data, this.movingTimeSteps);
        // console.log(smaSet);
        const outputDataset: ModelOutput = {
          modelID: this.selectedOutput.modelID,
          varName: dataset.label + " " + "SMA" + "-" + this.movingTimeSteps,
          varinfo: null,
          varValue: [],
        };

        // if the timeseries years are defined on the table with 't' key
        if (this.selectedOutput.varValue[0].hasOwnProperty("t")) {
          let i = 0;
          for (const val of smaSet) {
            outputDataset.varValue.push({
              t: this.selectedOutput.varValue[i].t,
              value: val,
            });
            i++;
          }
        } else {
          for (const val of smaSet) {
            outputDataset.varValue.push({ value: val });
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
   * Resets parameter values back to the default
   */
  onResetValues() {
    // clear appended output datasets
    this.appendedOutputSets = [];

    // clear appended output datasets
    this.appendedInputSets = [];

    // clear appended SMAs
    this.movingAverages = [];

    // clear table data and redraw selected output
    this.rowData = [];
    this.columnDefs = [];
    this.tableAppendDataset(this.selectedOutput);

    // clear plot data and redraw selected output
    if (this.selectedOutput.varValue.length > 0) {
      // cholo mode clean graph
      this.lineCounter = 0;
      this.lineChartData = [];
      this.lineChartLabels = [];

      // append converted data
      this.chartAppendOutputData(this.selectedOutput);

      // add benchmark data to the plot if any
      this.benchMarkIndex = 0;
      this.appendBenchmarks();
    }
  }

  /**
   * Switches to a different data visualization view.
   * @param vizMode Visualization modes: table, line chart or bar chart
   */
  onVizChange(vizMode: string) {
    // switch visualization mode
    this.mode = vizMode;

    // if plot visualization selected
    if (vizMode === "line" || "bar") {
      // change line chart type to user selected
      this.lineChartType = vizMode;

      // append benchmarks if any are available
      if (vizMode === "line") {
        this.appendBenchmarks();
      }
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
    this.tableAppendDataset(this.selectedOutput);

    // add selected output to table again
    this.chartAppendOutputData(this.selectedOutput);

    // append other output data sets if any
    if (this.appendedOutputSets.length > 0) {
      for (const outputSet of this.appendedOutputSets) {
        // change units here if not equal to the loaded units
        if (
          outputSet.varinfo[this.lanIndex].varUnit !==
          this.selectedOutput.varinfo[this.lanIndex].varUnit
        ) {
          this.changeOutputUnits(
            outputSet,
            outputSet.varinfo[this.lanIndex].varUnit,
            this.selectedOutput.varinfo[this.lanIndex].varUnit
          );
        }
        this.tableAppendDataset(outputSet);
        this.chartAppendOutputData(outputSet);
        this.appendBenchmarks();
      }
    }

    // append other input data sets if any
    if (this.appendedInputSets.length > 0) {
      for (const inputSet of this.appendedInputSets) {
        // change units here if not equal to the loaded units
        if (
          inputSet.paraminfo[this.lanIndex].paramUnit !==
          this.selectedOutput.varinfo[this.lanIndex].varUnit
        ) {
          this.changeInputUnits(
            inputSet,
            inputSet.paraminfo[0].paramUnit,
            this.selectedOutput.varinfo[this.lanIndex].varUnit
          );
        }
        this.tableAppendInputDataset(inputSet);
        this.chartAppendInputData(inputSet);
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
    this.mode = "";
    setTimeout(() => {
      this.onVizChange(wasMode);
    }, 100);
  }

  /**
   * Export image plot from canvas (only works on firefox so far)
   */
  onExportPlot() {
    let imageURL = this.chart.toBase64Image();
    imageURL = imageURL.replace(/^data:image\/[^;]+/, "data:image/png");
    window.open(imageURL);
  }

  /**
   * Performs unit convesions over all loaded inputs and outputs with visualization update
   */
  onSelectUnit() {
    // units target
    const unitTarget = this.selectedOutput.varinfo[this.lanIndex].varUnit;
    console.log("Converting from: " + this.oldUnits + " to: " + unitTarget);

    // current visualization mode so we can return to it after conversion
    const currentMode = this.mode;

    // update the unit conversion options
    this.unitOptions = this.unitConverter.GetConversionOptions(unitTarget);

    // unit conversion for these outputs
    this.changeOutputUnits(this.selectedOutput, this.oldUnits, unitTarget);

    // the unit conversion for the parameter benchamrks
    for (const bIndex in this.selectedOutput.varBenchMarks) {
      if (bIndex !== null) {
        this.selectedOutput.varBenchMarks[bIndex].benchmarkValue =
          this.unitConverter.Convert(
            this.oldUnits,
            unitTarget,
            this.selectedOutput.varBenchMarks[bIndex].benchmarkValue
          );
      }
    }

    /*** Redraw Widgets */

    // hide the visualization widgets
    this.mode = "";

    // extract the parameter units and add label to y-axis
    this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = unitTarget;

    // Clean all visualization widgets and re-add data
    this.onSetSelected();

    // append benchmarks if any are available
    if (currentMode === "line") {
      this.appendBenchmarks();
    }

    setTimeout(() => {
      this.mode = currentMode;
    }, 150);

    this.oldUnits = unitTarget;
  }

  /**
   *  Export parameter data to csv format.
   *  Note: does not work on iPad ios
   */
  onBtnExport() {
    const params = {
      skipHeader: false,
      allColumns: true,
      fileName: this.selectedOutput.varName + ".csv",
    };

    try {
      this.gridApi.exportDataAsCsv(params);
    } catch (error) {
      console.log("Error Export Data: " + error);
    }
  }

  /**
   * Assignment of the gridAPI
   * @param params generated grid parameters
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
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
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = prefix + "-" + key;
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
