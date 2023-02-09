/**
 * Model for HS user information.
 */
export interface HSUser {
  /** Unique user identifier on hydroshare */
  id: Number;
  /** String containing first name of the user */
  first_name: String;
  /** String containing last name of the user */
  last_name: String;
  /** String containing email address of the user */
  email: String;
  /** String containing hydroshare user type */
  user_type: String;
  /** Professional title */
  title?: String;
  /** Affiliated organization of the user */
  organization?: String;
  /** State of residence */
  state?: String;
  /** Country of residence */
  country?: String;
  /** Personal website */
  url?: String;
  /** Contact phone number */
  phone?: String;
  /** physical address */
  address?: String;
  /** ???? */
  website?: String;
  /** research areas of interest */
  subject_areas?: Array<String>;
  /** date that the user joined hydroshare */
  date_joined?: String;
}
