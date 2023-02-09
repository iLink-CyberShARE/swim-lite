import { Component, Inject, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OptionCatalogService } from 'src/app/services/option-catalog.service';
import { ParameterService } from '../../services/parameter.service';
import { Parameter } from 'src/app/models/parameter.model';

@Component({
  selector: 'app-time-range-dialog',
  templateUrl: './time-range-dialog.component.html',
  styleUrls: ['./time-range-dialog.component.css']
})
export class TimeRangeDialogComponent implements OnInit {

  /** slider step size */
  stepSize = 1;

  /** Minimum simulation time */
  minYears = 10;

  /** subscription to fetched option list */
  private optionSubs:  Subscription;

  /** Language Index */
  public lanIndex = 0;

  /** loading flag */
  public isLoading = true;

  /** no data found flag */
  public noData = false;

  /** pointer to start date parameter from model */
  public start: Parameter;

  /** pointer to end date from model */
  public end: Parameter;

  constructor(
    public parameterService: ParameterService,
    private optionCatalogService : OptionCatalogService,
    public dialogRef: MatDialogRef<TimeRangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private model_id: string
  ) {
    this.lanIndex = parameterService.lanIndex;
  }

  ngOnInit() {

    this.optionSubs = this.optionCatalogService
      .getOptionUpdateListener()
      .subscribe( ( optionCatalog : any[]) => {
        if (optionCatalog.length > 1){
          const paramNameStart = optionCatalog.filter(option => option.name === 'start')[0].parameter;
          const paramNameEnd = optionCatalog.filter(option => option.name === 'end')[0].parameter;
          this.start = this.parameterService.getParameterMetaByName(paramNameStart);
          this.end = this.parameterService.getParameterMetaByName(paramNameEnd);
        }
        else {
          this.noData = true;
        }
        this.isLoading = false;
      });

    this.optionCatalogService.getOptionsbyModelandType(this.model_id, 'time-range');

  }

  /**
   * Chek that start date is at least certain amount of years below end date.
   */
  validateStart(){
    if((this.start.paramValue + this.minYears) > this.end.paramValue){
      this.start.paramValue = this.end.paramValue - this.minYears;
    }
  }

  /**
   * Closes the dialog and cancels the submission of the scenario.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

}
