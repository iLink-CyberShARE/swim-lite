/**
 * Entity responsible for creating a resource
 */
export interface Creator {
  /** A string containing an address for the creator */
  address?: String;
  /** A string containing the path to the hydroshare profile */
  email?: String;
  /** An object containing the URL for website associated with the creator */
  homepage?: String;
  /** A dictionary containing identifier types and URL links to alternative identiers for the creator */
  identifiers?: Object;
  /** A string containing the name of the creator*/
  name?: String;
  /** A string containing the name of the organization with which the creator is affiliated */
  organization?: String;
  /** A string containing a phone number for the creator */
  phone?: String;
}
