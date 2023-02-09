import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

/**
 * SWIM API URL
 */
const SWIM_API =  environment.nodeServer + '/swim-api';

@Injectable({
  providedIn: 'root'
})

export class OptionCatalogService {

  /** Holds the current option dictionary */
  private optionCatalog: Array<any>;

  /** Subscription subject to the dictionary */
  private optionCatalogUpdated = new Subject<any[]>();

  /** Class contructor user http client class */
  constructor(private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Get the option catalog by model id and filtered by option category or types
   * @param modelID model identification string
   * @param type type of options e.g. time range options
   */
  getOptionsbyModelandType(modelID: string, type: string) {
    console.log('Fetching model option catalog');
    this.http
    .get<{ message: string; result: any[] }>(
      SWIM_API + '/options/model/' + modelID + '/type/' + type
    )
    .subscribe( data => {
      this.optionCatalog = data.result;
      this.optionCatalogUpdated.next([...this.optionCatalog]);
    }, (error) => {
      this.errorHandler.handleHttpError(error);
    });
  }

  /**
   * Get the catalog updated subject.
   */
  getOptionUpdateListener() {
    return this.optionCatalogUpdated.asObservable();
  }

}
