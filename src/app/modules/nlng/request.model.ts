// request.model.ts

import { ModelOutput } from "./modeloutput.model";

/**
 * Payload request for the narrative generation of a model output
 */
export interface Request {
  scenarioid: string;
  role: string;
  language: string;
  output: ModelOutput
}
