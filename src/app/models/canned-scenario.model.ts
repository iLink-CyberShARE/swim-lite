export interface CannedScenario {
  /** unique identifier for the canned scenario */
  _id?: string;
  /** name of the canned scenario */
  name: string;
  /** textual description of the canned scenario */
  description: string;
  /** model unique identifier linked to this canned scenario */
  modelID: string;
  /** hide data tools */
  hideTools: boolean;
  /** scenario id */
  scenarioID?: string;
  /** list of themes available for user view and manipulation */
  themeCatalogFilter?: Array<string>;
  /** list of parameters available for the user to view  */
  parameterFilter?: Array<string>;
  /** list of model outputs available for the user to view  */
  outputFilter?: Array<string>;
}
