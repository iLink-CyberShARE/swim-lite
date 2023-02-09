/**
 * Model for HS token information
 */
export interface Token{
  /** Current access token to HS services */
  access_token: string;
  /** Type of token */
  token_type: string;
  /** claim scope */
  scope?: string;
  /** ??? */
  state?: string;
  /** Token expiration date time is ms */
  expires_in?: Number;
  /** token to use for quick refresh of expiring token */
  refresh_token?: string;
}
