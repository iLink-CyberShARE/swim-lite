/**
 * The parameter data model maps to the parameter-catalog database collection.
 * A Parameter holds a scientific model input and its metadata.
 */
export interface Parameter {
  /** Target model identifier for this parameter */
  modelID: string;
  /** Data set type: double, integer, boolean, string */
  dataType: string;
  /** Unique name used on the model source code for this parameter */
  paramName: string;
  /** How the parameter can be set: user, scenario, static */
  definitionType: string;
  /** Upper bound on the values that the parameter can have */
  maxValue: number;
  /** Lower bound on the values that the parameter can have */
  minValue: number;
  /** Origin or source of the default parameter value */
  paramDefaultSource: string;
  /** Dataset structure: scalar, table or matrix */
  structType: string;
  /** Dimension of the dataset structure if it is table or matrix  */
  structDimension?: string;
  /** Widget used for user customization on the interface: slider, table, multi-slider */
  widget?: string;
  /** Resolution of each step jump if the parameter used the slider widgets  */
  stepSize?: number;
  /** Parameter information objects */
  paraminfo: Array<ParamInfo>;
  /** Parameter benchmark objects */
  paramBenchMarks?: Array<ParamBenchmark>;
  /** Default dataset values applied to the parameter */
  paramDefaultValue: any;
  /** Modified dataset values after user manipulation */
  paramValue?: any;
}

/**
 * The ParamInfo objects is part of a Parameter model and holds information about a model input
 * in a specific language that will be displayed to end users.
 */
export interface ParamInfo {
  /** Parameter category for catalog filters */
  paramCategory: string;
  /** Unit of measure for parameter values */
  paramUnit: string;
  /** User readable label for parameter */
  paramLabel: string;
  /** Target language for the parameter information */
  lang: string;
  /** Parameter description */
  paramDescription: string;
}

/**
 * The ParamBenchmark holds additional datasets that provide additional context or meaning
 * to a model input.
 */
export interface ParamBenchmark {
  /** Benchmark label */
  benchmarkLabel: string;
  /** Language of the benchmark information */
  benchmarkLang: string;
  /** Benchmark description */
  benchmarkDescription: string;
  /** Origin of the benchmark data value */
  benchmarkSource: string;
  /** Benchmark value */
  benchmarkValue: any;
}
