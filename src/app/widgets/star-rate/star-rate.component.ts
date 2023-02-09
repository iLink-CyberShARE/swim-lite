import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Data
import { ModelOutput } from '../../models/output.model';

/**
 * This component opens up a dialog box that holds from one to multiple star rating mechanisms and holds the
 * results.
 */
@Component({
  selector: 'app-star-rate',
  templateUrl: './star-rate.component.html',
  styleUrls: ['./star-rate.component.css']
})

export class StarRateComponent implements OnInit {

  /** List of rated elements */
  ratingList: any[] = [];

  /** Flag to check if all elements have been rated */
  allrated = false;

  /** ranked items historically */
  private rankedItems = [];

  /**
   * Class constructor
   * @param dialogRef Dialog box functionality
   * @param selectedOutputs receives a list of user selected outputs
   */
  constructor(
    public dialogRef: MatDialogRef<StarRateComponent>,
    @Inject(MAT_DIALOG_DATA) public selectedOutputs: ModelOutput[]
  ) { }

  /**
   * Initialization function sets ranked items list from cookies
   */
  ngOnInit(): void {
    // load ranked items from local storage
    this.rankedItems = JSON.parse(localStorage.getItem('rankedItems'));

    if (this.rankedItems === null) {
      this.rankedItems = []
    }
  }

  /**
   * Dialog close on cancel.
   * (Not used on this component)
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Function that is called after an output has been rated and stores the rating in a list
   * @param rated the output that was rated (name and rating value)
   */
  onRated(rated: any) {

    // add if not added
    if (!this.ratingList.find(x => x.outputName === rated.outputName)) {
      this.ratingList.push(rated);
      this.rankedItems.push(rated.outputName);
    }

    // activate all rated once all outputs have been ranked, this will enable submit button
    if (this.ratingList.length === this.selectedOutputs.length) {
      localStorage.setItem('rankedItems', JSON.stringify(this.rankedItems));
      this.allrated = true;
    }

  }

}
