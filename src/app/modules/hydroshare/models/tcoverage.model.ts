/**
 * Information about the temporal topic or applicability of a resource
 */
export interface TCoverage {
  /** A datetime object containing the instant corresponding to the termination of the time interval */
  end: String; // date-time
  /** A string containing a name for the time interval */
  name?: String;
  /** A datetime object containing the instant corresponding to the commencement of the time interval */
  start: String; // date-time
}
