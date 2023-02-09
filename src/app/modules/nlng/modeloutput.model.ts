/**
 * The Output data model maps to the output-catalog collection.
 * An output in refers to a variable extracted from the execution of a
 * scientifc model.
 */

export interface ModelOutput {
  /** Model identifier where the output is generated from */
  modelID: string;
  /** Output name identifier unique to each model */
  varName: string;
  /** Output information */
  varinfo: Array<VarInfo>;
  /** Output benchmark data */
  varBenchMarks?: Array<VarBenchmark>;
  /** data results from model execution */
  varValue: any;
}

/**
 * Holds metadata of a model output in a specified language.
 */
 export interface VarInfo {
  /** Output label */
  varLabel: string;
  /** Output category name */
  varCategory: string;
  /** Language of information object */
  lang: string;
  /** Output description */
  varDescription: string;
  /** Unit of measure for the values of the output */
  varUnit: string;
}

/**
 * The VarBenchmark data model holds supporting datasets that provide additional context
 * to the resulting output from a scientic model.
 */
 export interface VarBenchmark {
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
