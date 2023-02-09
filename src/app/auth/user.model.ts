/**
 * User class
 */
export class User {
  /**
   * Class constructor
   * @param email user email
   * @param _token token
   * @param _tokenExpirationDate token expiration
   */
  constructor(
    public email: string,
    private _token: string,
    private _tokenExpirationDate: Date,
    private _id: number,
    private isGuest: boolean,
    private role?: string,
    private isCont?: boolean
  ) {}

  /**
   * Get the user token
   */
  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }

  /**
   * Get user token expiration datetime
   */
  get tokenExpirationDate() {
    return this._tokenExpirationDate;
  }

  /**
   * Get user guest statues
   */
  get guestStatus() {
    return this.isGuest;
  }

  /**
   * Get the user id identification number
   */
  get userId() {
    return this._id;
  }

}
