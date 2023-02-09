import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LoggerService } from '../../../services/logger.service';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

/**
 * Aplication error page
 */
@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})

export class ErrorComponent implements OnInit {

  faExclamationTriangle = faExclamationTriangle;

  /** Error Code */
  errorCode = '';

  /** Error Message */
  errorMessage: string;

  /** Error notification to user */
  errorNotification = 'Ooops! An error has occurred =(';

  /**
   * Class constructor
   */
  constructor(public route: ActivatedRoute, private loggerService: LoggerService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('errorMessage')) {
        this.errorMessage = paramMap.get('errorMessage');
        // report error to the SWIM Logs
        const errorLog = this.loggerService.LogEvent(5, 4, this.errorMessage);
        errorLog.subscribe( (response) => { });
      }
    });
  }

}
