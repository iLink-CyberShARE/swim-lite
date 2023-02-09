/**
 * The Theme data model maps to database theme-catalog collection.
 * A theme is a pre-defined scenario option that modifies the values of
 * one or more model inputs such as paramater and set values.
 */
export interface Theme {
  /** Theme identifier string */
  _id: string;
  /**  Linked model identifier */
  modelID: string;
  /** Thumbnail image for the theme (ui) */
  thumbnail?: string;
  /** Link to a source */
  sourceLink?: string;
  /**  Flag if the theme has been selected or not */
  isSelected?: boolean;
  /**  Order of appearance on the ui */
  order?: number;
  /** Multi-language information object */
  info: ThemeInfo[];
  /** list of model paramers affected by the theme */
  parameters?: RelatedParameter[];
  /** List of related sets affected by the theme */
  sets?: RelatedSet[];
}

/**
 * The RelatedParameter data model is part of a set of parameters that are
 * affected by a scenario theme. It contains the unique name of the target parameter
 * parameter values corresponding to the theme and a flag to show the data to the user.
 */
export interface RelatedParameter {
  /** Parameter unique name used on model source code */
  paramName: string;
  /** Flag to show the parameter on the show data box */
  paramShow: boolean;
  /** Parameter values for the underlying theme */
  paramValue: any;
}

/**
 * The RelatedSet data model is part of a set of model seta that are affected by a scenario
 * theme. It contains the unique name of the target set and set values corresponding to the theme.
 */
export interface RelatedSet {
  /** Name of a set (GAMS) */
  setName: string;
  /** Value of a set (GAMS) */
  setValue: string;
}

/**
 * The theme information holds scenario metadata in a specified language.
 */
export interface ThemeInfo {
  /** Target language of this object */
  lang: string;
  /** Title of the scenario theme */
  title: string;
  /** Text about the scenario theme */
  description: string;
  /** Scenario category to which this theme belongs to */
  category: string;
  /** source of the data values */
  sourceLabel?: string;
  /** any additional information about the scenario theme */
  appendix?: string;
  /** source path of theme image */
  imgSource?: string;
  /** image citation */
  imgCitation?: string;
}
