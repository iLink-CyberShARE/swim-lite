/**
 * Information about the funding agencies and awards associated with a resource
 */
export interface Award {
  /** A string containing the name of the funding agency or organization */
  funding_agency_name: String;
   /** An object containing a URL pointing to a website describing the funding award */
  funding_agency_url?: String;
  /** A string containing the award number or other identifier */
  number: String;
  /** A string containing the title of the project or award */
  title: String;
}
