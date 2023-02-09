export interface Pallete {
  colorRGB: string;
  pattern: Array<number>;
}

/** ChartJS color Pallet dictionaries */
export class PalleteConstants {
  private linePalette: Pallete[] = [
    {colorRGB: 'rgb(213,94,0)',    pattern: [5, 3]},
    {colorRGB: 'rgb(204,121,167)', pattern: [0, 0]},
    {colorRGB: 'rgb(0,114,178)',   pattern: [8, 5]},
    {colorRGB: 'rgb(204,192,35)',  pattern: [0, 0]},
    {colorRGB: 'rgb(0,158,115)',   pattern: [5, 8]},
    {colorRGB: 'rgb(86,180,233)',  pattern: [0, 0]},
    {colorRGB: 'rgb(230,159,0)',   pattern: [15, 3]},
    {colorRGB: 'rgb(0,0,0)',       pattern: [1, 1]},
    {colorRGB: 'rgb(250,153,6)',   pattern: [8, 5]},
    {colorRGB: 'rgb(10,8,174)',    pattern: [0, 0]},
    {colorRGB: 'rgb(161,99,4)',    pattern: [5, 8]},
    {colorRGB: 'rgb(158,164,245)', pattern: [0, 0]},
    {colorRGB: 'rgb(52,106,146)',  pattern: [5, 15]},
    {colorRGB: 'rgb(93,122,143)',  pattern: [8, 5]},
    {colorRGB: 'rgb(199,160,3)',   pattern: [1, 1]},
    {colorRGB: 'rgb(92,60,251)',   pattern: [1, 1]},
    {colorRGB: 'rgb(223,129,14)',  pattern: [0, 0]},
    {colorRGB: 'rgb(133,152,174)', pattern: [8, 5]},
    {colorRGB: 'rgb(56,54,32)',    pattern: [5, 10]},
    {colorRGB: 'rgb(0,226,299)',   pattern: [0, 0]},
    {colorRGB: 'rgb(255,211,0)',   pattern: [1, 1]},
    {colorRGB: 'rgb(95,95,93)',    pattern: [0, 0]},
    {colorRGB: 'rgb(27,85,104)',   pattern: [8, 5]},
    {colorRGB: 'rgb(189,169,100)', pattern: [5, 10]},
    {colorRGB: 'rgb(210,206,201)', pattern: [0, 0]},
    {colorRGB: 'rgb(60,205,194)',  pattern: [8, 5]},
    {colorRGB: 'rgb(131,137,22)',  pattern: [5, 8]},
    {colorRGB: 'rgb(75,109,201)',  pattern: [20, 3]},
    {colorRGB: 'rgb(1,13,76)',     pattern: [20, 25]},
    {colorRGB: 'rgb(210,181,140)', pattern: [0, 0]},
    {colorRGB: 'rgb(93,160,251)',  pattern: [10, 15]},
    {colorRGB: 'rgb(161,99,4)',    pattern: [1, 1]}
  ];

  private benchMarkPalette: Pallete[] = [
    {colorRGB: 'rgb(0,114,178)',   pattern: [0, 0]},
    {colorRGB: 'rgb(0,0,0)',       pattern: [0, 0]},
    {colorRGB: 'rgb(230,159,0)',   pattern: [0, 0]},
    {colorRGB: 'rgb(86,180,233)',  pattern: [0, 0]},
    {colorRGB: 'rgb(0,158,115)',   pattern: [0, 0]},
    {colorRGB: 'rgb(240,228,66)',  pattern: [0, 0]},
    {colorRGB: 'rgb(204,121,167)', pattern: [0, 0]},
    {colorRGB: 'rgb(213,94,0)',    pattern: [0, 0]}
  ];

  /**
   * Returns a color and pattern from the line palette dictionary.
   * Used for chartjs plots.
   * @param index position on the line palette dictionary
   */
  public getLinePallete(index: number) {
    if (index < this.linePalette.length) {
      return this.linePalette[index];
    } else {
      index = Math.floor(Math.random() * Math.floor(this.linePalette.length - 1));
      return this.linePalette[index];
    }
  }

  /**
   * Returns a color and pattern from the benchmark palette dictionary.
   * Used for chartjs plots.
   * @param index position on the benchmarl palette dictionary
   */
  public getBenchmarkPallete(index: number) {
    if (index < this.benchMarkPalette.length) {
      return this.benchMarkPalette[index];
    } else {
      index = Math.floor(Math.random() * Math.floor(this.benchMarkPalette.length - 1));
      return this.benchMarkPalette[index];
    }

  }
}



