import {
  Component,
  OnInit,
  Input,
  Inject,
  LOCALE_ID,
  ElementRef,
} from "@angular/core";
import { ChartDataSets, ChartOptions } from "chart.js";
import { Color, BaseChartDirective, Label } from "ng2-charts";

// Services
import { OutputService } from "../../services/output.service";
import { PalleteConstants } from "src/app/models/pallete.model";
import { AcronymCatalogService } from "../../services/acronym-catalog.service";
import { ParameterService } from "src/app/services/parameter.service";

// Models
import { Overview } from "src/app/models/overview.model";
import { ModelOutput } from "src/app/models/output.model";


@Component({
  selector: "app-summary-box",
  templateUrl: "./summary-box.component.html",
  styleUrls: ["./summary-box.component.css"],
})
export class SummaryBoxComponent implements OnInit {
  @Input() specification: Overview;

  /** tempLabels */
  private tempLabels = [];

  /** Loading */
  public isLoading = true;

  /** Language Index */
  public lanIndex = 0;

  /** Palette Dictionary */
  paletteDictionary: PalleteConstants;

  /** Acronym dictionary */
  private acronymDictionary: any = {};

  /** Temporal assuming only one output target */
  private targetOutput: ModelOutput;

  /** Final with multiple output targets */
  private targetOutputs: ModelOutput[] = [];

  /** Fill-Percent-Gauge Attributes */
  public options = {};
  public canvasWidth = 450;
  public centralLabel = "";
  public name = "";
  public bottomLabel = ""; // to calculate
  public bottomLabelFont = 30;
  public nameFont = 20;

  /** Chart JS Plot Attributes */
  public plotType = "bar";
  public plotData: ChartDataSets[] = [];
  public plotLabels: Label[] = [];
  public plotReverse = false; // TODO: add this to mongo specification
  public plotColors: Color[] = [];
  public plotShowLegend = true;
  public plotVisible = false;
  public plotOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            reverse: this.plotReverse,
            beginAtZero: true,
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
  };

  constructor(
    public outputService: OutputService,
    private acronymCatalogService: AcronymCatalogService,
    private parameterService: ParameterService,
    private host: ElementRef<HTMLElement>,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.lanIndex = parameterService.lanIndex;
  }

  ngOnInit() {
    // Load plot pallete dictionary
    this.paletteDictionary = new PalleteConstants();

    // Load acronym dictionary
    this.acronymDictionary = this.acronymCatalogService.getAcronymDictionary();

    // value calculated from performing the operation
    let value: any;
    let label: String[] = [];

    // fetch the target output variable from the model results
    // this.targetOutput = this.outputService.getOutputByName(this.specification.data.targets[0]);

    // fetch several output variables from the model results
    for (const target of this.specification.data.targets) {
      const output = this.outputService.getOutputByName(target);
      if (typeof output !== "undefined") {
        this.targetOutputs.push(this.outputService.getOutputByName(target));
      }
    }

    // check if there were any target outputs available or if visible set to false, otherwise self-destroy
    if (this.targetOutputs.length < 1 || this.specification.visible === false) {
      this.specification.visible = false;
      this.CloseComponent();
      return;
    }

    // select and perform operation from the specification
    switch (this.specification.data.operation) {
      case "last": {
        value = this.GetSeriesLast(this.targetOutputs[0].varValue);
        break;
      }
      case "first": {
        value = this.GetSeriesFirst(this.targetOutputs[0].varValue);
        break;
      }
      case "average": {
        value = this.GetSeriesAverage(this.targetOutputs[0].varValue);
        break;
      }
      case "table-average": {
        value = this.GetTableAverage(this.targetOutputs[0].varValue);
        label = this.tempLabels;
        break;
      }
      case "table-first": {
        value = this.GetTableFirst(this.targetOutputs[0].varValue);
        label = this.tempLabels;
        break;
      }
      case "table-last": {
        value = this.GetTableLast(this.targetOutputs[0].varValue);
        label = this.tempLabels;
        break;
      }
      case "table-diff": {
        value = this.GetTableDiff(this.targetOutputs[0].varValue);
        label = this.tempLabels;
        break;
      }
      case "multi-last": {
        value = [];
        for (const variable of this.targetOutputs) {
          if (typeof variable !== "undefined") {
            value.push(this.GetSeriesLast(variable.varValue));
            label.push(variable.varinfo[this.lanIndex].varLabel);
          }
        }
        break;
      }
      default: {
        return;
      }
    }

    // Initialize widget according to spec
    if (this.specification.widget.type === "fill-percent-gauge") {
      this.InitFillGauge(value);
    } else if (this.specification.widget.type === "horizontal-bars") {
      this.plotType = "horizontalBar";
      this.plotShowLegend = true;
      this.InitBarPlot(value, label);
    } else if (this.specification.widget.type === "single-bar-plot") {
      this.InitBarPlot(value, label);
    }

    this.isLoading = false;
  }

  /**
   * Component self-destroy method
   */
  private CloseComponent() {
    this.host.nativeElement.remove();
  }

  /*****************************
   *     Widget Builders
   *****************************/

  /**
   * Fill gauge widget
   * @param valueResult gauge value before converting to percentage
   */
  private InitFillGauge(valueResult: number) {
    try {
      // object array with graph inputs
      const ginputs = [];
      const arcDelimitersArray = [];
      const arcColorsArray = [];
      const arcLabelsArray = [];
      // calculate percentages
      this.specification.widget.needleValue =
        (valueResult / this.specification.data.upperLimit) * 100;
      this.specification.widget.needleValue = this.round(
        this.specification.widget.needleValue,
        0
      );
      if (this.specification.widget.needleValue <= 0)
        this.specification.widget.needleValue = 0.01;

      // update widget specs
      this.bottomLabel = this.specification.widget.needleValue + "%";
      // insert calculated values and colors
      ginputs.push({
        arcLabel: "",
        arcColor: "blue",
        arcDelimiter: this.specification.widget.needleValue,
      });

      // insert benchmark values and colors
      if (typeof this.specification.benchmarks !== "undefined") {
        let benchMarkPercent =
          (this.specification.benchmarks[this.lanIndex].value /
            this.specification.data.upperLimit) *
          100;
        benchMarkPercent = this.round(benchMarkPercent, 2);
        ginputs.push({
          arcLabel:
            this.specification.benchmarks[this.lanIndex].acronym +
            ": " +
            benchMarkPercent +
            "%",
          arcColor: "rgb(44, 151, 222)",
          arcDelimiter: 43.95,
        });
      }
      // insert empty color
      ginputs.push({ arcColor: "lightgrey", arcDelimiter: 100 });
      // sort inputs by delimiter value
      ginputs.sort((n1, n2) => n1.arcDelimiter - n2.arcDelimiter);

      for (const entry of ginputs) {
        if (entry.arcDelimiter !== 100) {
          arcDelimitersArray.push(entry.arcDelimiter);
          arcLabelsArray.push(entry.arcLabel);
        }
        arcColorsArray.push(entry.arcColor);
      }

      this.options = {
        hasNeedle: true,
        needleColor: "black",
        needleUpdateSpeed: 1000,
        arcPadding: 2,
        arcPaddingColor: "white",
        arcLabels: arcLabelsArray,
        arcColors: arcColorsArray,
        arcDelimiters: arcDelimitersArray,
        rangeLabel: [
          this.specification.widget.rangeLabel[0],
          this.specification.widget.rangeLabel[1],
        ],
        needleStartValue: 0,
      };

      this.plotVisible = true;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Simple bar plot summary widget
   * @param valueResults array with values to plot
   */
  private InitBarPlot(valueResults: number[], valueLabel) {
    try {
      let labelIndex = 0;
      this.plotOptions.scales.yAxes[0].scaleLabel.labelString =
        this.specification.info[this.lanIndex].units;
      this.plotOptions.scales.yAxes[0].ticks.reverse =
        this.specification.widget.reverse;

      if (typeof this.specification.widget.multiplier === "undefined") {
        this.specification.widget.multiplier = 1;
      }

      let i = 0;
      for (const value of valueResults) {
        const values = [];
        values.push(value * this.specification.widget.multiplier);
        const ds = {
          label: valueLabel[i],
          data: values,
          hidden: false,
          fill: false,
          borderColor:
            this.paletteDictionary.getBenchmarkPallete(labelIndex).colorRGB,
          backgroundColor:
            this.paletteDictionary.getBenchmarkPallete(labelIndex).colorRGB,
          borderDash:
            this.paletteDictionary.getBenchmarkPallete(labelIndex).pattern,
        };

        this.plotData.push(ds);
        labelIndex++;
        i++;
      }

      this.plotVisible = true;
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /********************************
   * Data Aggregation Operations
   ******************************/
  /**
   * Gets the last value from a SWIM time series
   */
  private GetSeriesLast(varValue: any[]) {
    try {
      if (varValue.length >= 1) {
        const size = varValue.length;
        return this.round(varValue[size - 1].value, 2);
      }
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /**
   * Gets the first value from a SWIM time series
   */
  private GetSeriesFirst(varValue: any[]) {
    try {
      if (varValue.length > 1) {
        return this.round(varValue[0].value, 2);
      }
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /**
   * Gets the average value from a SWIM time series
   */
  private GetSeriesAverage(varValue: any[]) {
    try {
      let sum = 0;
      if (varValue.length > 1) {
        for (const iterator of varValue) {
          sum += iterator.value;
        }
        return this.round(sum / varValue.length, 2);
      }
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /**
   * TODO: Gets the average rate chage from a time series
   */
  private GetAverageRateChange() {}

  /**
   * Gets the difference between the starting value and the ending value of a series
   * @param varValue series of values
   */
  private GetSeriesDiff(varValue: any[]) {
    try {
      let change = 0;
      change = varValue[0].value - varValue[varValue.length - 1].value;
      return this.round(change, 2);
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  private SetTableLabels(series) {
    // fix the magic here
    let label = "";
    for (const key in series[0]) {
      if (key !== null && key !== "value" && key !== "t") {
        // look up on acronym dictionary
        let tempLabel = series[0][key];
        if (tempLabel in this.acronymDictionary.dictionary) {
          tempLabel = this.acronymDictionary.dictionary[tempLabel];
        }
        label += tempLabel + " ";
      }
    }
    // remove the last dash character
    if (label.lastIndexOf(" ") === label.length - 1) {
      label = label.slice(0, -1);
    }

    return label;
  }

  /**
   * Calculates average for each filtered series
   * @param varValue table of data
   */
  private GetTableAverage(varValue: any[]) {
    try {
      const values = [];
      for (const obj of this.specification.data.filters) {
        const key = Object.keys(obj)[0]; // TODO: consider all array to filter out by multi keys
        const series = varValue.filter((a) => a[key] === obj[key]);
        this.tempLabels.push(this.SetTableLabels(series));
        const average = this.GetSeriesAverage(series);
        values.push(average);
      }
      if (values.length === 1) {
        return values[0];
      }
      return values;
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /**
   * Gets the last value for each filtered series
   * @param varValue table of data
   */
  private GetTableLast(varValue: any[]) {
    try {
      const values = [];
      for (const obj of this.specification.data.filters) {
        const key = Object.keys(obj)[0];
        const series = varValue.filter((a) => a[key] === obj[key]);
        this.tempLabels.push(this.SetTableLabels(series));
        const last = this.GetSeriesLast(series);
        values.push(last);
      }
      if (values.length === 1) {
        return values[0];
      }
      return values;
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /**
   * Gets the first value for each filtered series
   * @param varValue table of data
   */
  private GetTableFirst(varValue: any[]) {
    try {
      const values = [];
      for (const obj of this.specification.data.filters) {
        const key = Object.keys(obj)[0];
        const series = varValue.filter((a) => a[key] === obj[key]);
        this.tempLabels.push(this.SetTableLabels(series));
        const first = this.GetSeriesFirst(series);
        values.push(first);
      }
      if (values.length === 1) {
        return values[0];
      }
      return values;
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /**
   * Gets the difference from start to end for each filtered series
   * @param varValue table of data
   */
  private GetTableDiff(varValue: any[]) {
    try {
      const values = [];
      for (const obj of this.specification.data.filters) {
        const key = Object.keys(obj)[0];
        const series = varValue.filter((a) => a[key] === obj[key]);
        this.tempLabels.push(this.SetTableLabels(series));
        const diff = this.GetSeriesDiff(series);
        values.push(diff);
      }
      if (values.length === 1) {
        return values[0];
      }
      return values;
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /****************
   * Helpers
   * ************/

  /**
   * Round number to a maximum number of decimal digits
   * @param value numerical value to round up
   * @param precision number of decimal digits
   */
  private round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }
}
