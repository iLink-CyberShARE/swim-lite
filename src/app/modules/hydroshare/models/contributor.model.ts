/**
 * Entity that contributed to a resource.
 */
export interface Contributor {
  /** A string containing an address for the contributor */
  address?: String;
  /** A string containing the path to the hydroshare profile */
  email?: String;
  /** An object containing the URL for website associated with the contributor */
  homepage?: String;
  /** A dictionary containing identifier types and URL links to alternative identiers for the contributor */
  identifiers?: Object;
  /** A string containing the name of the contributor */
  name?: String;
  /** A string containing the name of the organization with which the contributor is affiliated */
  organization?: String;
  /** A string containing a phone number for the contributor */
  phone?: String;
}
