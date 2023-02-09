import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { LoggerService } from '../../../services/logger.service';
import { faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {

  faLock = faLock;

  /** Error Message */
  errorMessage =  'Please allow use of cookies on the cookie consent box to access this feature.';

  /** Error notification to user */
  errorNotification = 'Unauthorized Access';

  constructor(public route: ActivatedRoute, private loggerService: LoggerService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('errorMessage')) {
        // report error to the SWIM Logs
        // const errorLog = this.loggerService.LogEvent(4, 1, paramMap.get('errorMessage'));
        // errorLog.subscribe( (response) => { });
      }
    });
  }

}
