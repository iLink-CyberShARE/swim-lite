import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';

/**
 * The star rating comoponent generates a widget to rate model outputs.
 */
@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css']
})

export class StarRatingComponent implements OnInit {

  faStarEmpty = faStarEmpty;
  faStarSolid = faStarSolid;

  /** The label of the selected rating value to show above the stars */
  selectedRatingLabel = '';

  /** Rating output that included the variable  name and rating value */
  ratingOutput = {
    outputName : '',
    outputRating : 0
  };

  /** List of legends according to the rating value */
  ratingLabels: Array<string> = [
    'Not Relevant',
    'Slightly Relevant',
    'Moderately Relevant',
    'Relevant',
    'Very Relevant'
  ];

  /** List of star icons */
  starIcons: Array<any> = [
    faStarEmpty,
    faStarEmpty,
    faStarEmpty,
    faStarEmpty,
    faStarEmpty
  ];

  /** Class constructor */
  constructor() { }

  /** Receives name of the output to rate */
  @Input() targetOutputName: string;
  /** receives label of the output to show */
  @Input() targetOutputLabel: string;

  /** Output retting value */
  @Output() rateEvent = new EventEmitter<any>();

  /**
   * Class inicialization method, sets the variable name of the output to rate.
   */
  ngOnInit() {
    this.ratingOutput.outputName = this.targetOutputName;
  }

  /**
   * Updates the selected rating value and labels
   * Updates the icon star array to fill up to the selected rating value
   * @param rating user selected rating value
   */
  onSelectedStar(rating: number) {
    this.ratingOutput.outputRating = rating;
    this.selectedRatingLabel = this.ratingLabels[rating - 1];

    for (let i = 0; i < 5; i++) {
      if ( i < rating ) {
        this.starIcons[i] = faStarSolid;
      } else {
        this.starIcons[i] = faStarEmpty;
      }
    }

    this.rateEvent.emit();

  }

}
