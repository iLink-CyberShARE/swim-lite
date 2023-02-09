import { Overview } from '../models/overview.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Inject, LOCALE_ID } from '@angular/core';

/**
 * SWIM API URL
 */
const SWIM_API = environment.nodeServer + '/swim-api';

/**
 * Scenario theme catalog service
 */
@Injectable({
  providedIn: 'root',
})
export class SummaryCatalogService {
  /** Summary Listing */
  private summaryCatalog: Overview[] = [];

  /** summary catalog updated subject */
  private summaryCatalogUpdated = new Subject<Overview[]>();

  /** Class contructor uses http client */
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  /**
   * Get the listing of summary widgets for the current model
   * @param modelId model identifier
   */
  GetSummaryCatalog(modelId: string) {
    console.log('Fetching summary catalog');
    this.http
    .get<{message: string; result: Overview[]}>(
      SWIM_API + '/summaries/' + modelId
    )
    .subscribe( data => {
      this.summaryCatalog = data.result;
      this.summaryCatalog = this.summaryCatalog.sort((first, second) => 0 - (first.order > second.order ? -1 : 1));
      this.summaryCatalogUpdated.next([...this.summaryCatalog]);
    }, (error) => {
      // nothing to do here
      this.summaryCatalog = [];
      this.summaryCatalogUpdated.next([...this.summaryCatalog]);
    });
  }

  /**
   * Get theme catalog updated subject
   */
  GetSummaryUpdateListener() {
    return this.summaryCatalogUpdated.asObservable();
  }

}
