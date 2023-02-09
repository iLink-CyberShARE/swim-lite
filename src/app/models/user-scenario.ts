import { Parameter } from './parameter.model';
import { ModelOutput } from './output.model';

/**
 * The UserScenario data model maps to the private, canned and public scenarios database collections.
 * The user scenario is a complete specification and result package aligned to one or multiple scientific models.
 * It holds scenario metadata, model settings, model sets, model inputs and model outputs. The user scenario specification
 * is sent to the SWIM backend for processing and is extended with execution results and additional metadata as a response.
 */
export interface UserScenario {
  /** Unique identifier for scenario submited for execution */
  id: string;
  /** Mapped class on Java-Morphia */
  className?: string;
  /** User assigned scenario name */
  name: string;
  /** Interface aided description of the submited scenario */
  description: string;
  /** User identifier that created the custom scenario */
  userid?: string;
  /** Timestamp of when the scenario started to be processed */
  startedAtTime?: string;
  /** Timestamp of when the scenario finished processing  */
  endedAtTime?: string;
  /** Status in the execution cycle: queued, complete, failed */
  status: string;
  /** starting date-time of projection */
  start?: string;
  /** year, month, day, hour, minute, second */
  timestep?: string;
  /** Flag if the user scenario is available to public */
  isPublic?: boolean;
  /** model settings and model id container */
  modelSettings?: any[];
  /** model set container */
  modelSets?: any[];
  /** result overviews */
  resultOverviews?: any[];
  /** model input container */
  modelInputs?: Parameter[];
  /** model output container */
  modelOutputs?: ModelOutput[];
}
