
/**
 * Library with methods to perform analysis operations
 * over sets of data.
 */
export class DataAnalytics {

  constructor() {}

  /**
   * Simple Moving Average
   * Performs a rolling average operation over a one dimensional array
   * of numbers.
   * @param timesteps numer of timesteps for average rollover
   * @param series array with value series
   */
  public SMA( series: number[], timesteps: number) {
    try {
      const result = [];
      // validate input ranges
      if (timesteps > series.length || timesteps < 2) {
        return null;
      }
      // calculate roling average for each series slot
      for (let i = 0; i < series.length; i++) {
        if ( i >= timesteps - 1) {
          result.push(this.Average(series.slice((i + 1) - timesteps, i + 1)));
        } else {
          result.push(null);
        }
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Gets the average from an array of numbers.
   * @param series array of numbers
   */
  private Average(series: number[]) {
    try {
      let sum = 0;
      if (series.length > 1) {
        for (const i of series) {
          sum += i;
        }
        return this.round((sum / series.length), 2);
      }
    } catch (error) {
      console.log(error); // log this to db
    }
  }

  /****************
   * Helpers
   * ************/

   /**
    * Round number to a maximum number of decimal digits
    * @param value numerical value to round up
    * @param precision number of decimal digits
    */
  private round(value, precision) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

}

