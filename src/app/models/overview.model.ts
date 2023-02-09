/**
 * The overview model stores aggregate result and metadata after performing
 * a mathematical operation over a set of model output values. It is used to present
 * the user aggregate outputs as a summary of a model run.
 */
export interface Overview {
  /** Labels for user on specific language */
  info: OverviewInfo[];
  /** data related attributes */
  data: OverviewData;
  /** context data */
  benchmarks?: OverviewBenchmark[];
  /** Data presentation visualization for the overview
   *  types: fill-percent-gauge, single-bar-plot, horizontalBar
   */
  widget: any;
  /** if the summary will be visible or not */
  visible?: boolean;
  order?: number;
}

/**
 * user labels
 */
export interface OverviewInfo {
  /** title or label of the result overview */
  caption: string;
  /** descriptive caption abour the result overview */
  subcaption: string;
  /** Original value units */
  units: string;
  /** language */
  lang: string;
}

/**
 * data related attributes
 */
export interface OverviewData {
  /** unique name of the variable where the results will be derived from */
  targets: string[];
  /** table filters by key and value pair */
  filters?: any[];
  /** type of mathematical operation to be performed on variable values
   *  Requirement: structure types must be matrix or table
   *  options: last, first, average, table-average, table-first, table-last, table-diff, multi-last
   */
  operation: string;
  /** The highest value that the output can take */
  upperLimit: number;
   /** The lowest value that the output can take */
  lowerLimit?: number;
}

/**
 * context benchmarks
 */
export interface OverviewBenchmark {
  /** an acronym that will be placed on the visualization widget */
  acronym: string;
  /** description of the benchmark */
  label: string;
  /** benchmark value */
  value: number;
  /** target language */
  lang: string;
}
