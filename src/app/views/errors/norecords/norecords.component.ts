import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

/**
 * Aplication error page
 */
@Component({
  selector: 'app-norecord',
  templateUrl: './norecords.component.html',
  styleUrls: ['./norecords.component.css']
})

export class NoRecordsComponent implements OnInit {

  faThumbsDown = faThumbsDown;

  /** Error Code */
  errorCode = '';

  /** Error Message */
  errorMessage: string;

  /** Error notification to user */
  errorNotification = 'No Records Found!';

  /**
   * Class constructor
   */
  constructor(public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('errorMessage')) {
        this.errorMessage = 'You have not created any private model scenarios.';
        // this.errorMessage = paramMap.get('errorMessage');
      }
    });
  }

}
