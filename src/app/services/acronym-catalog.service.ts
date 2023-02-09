import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

/**
 * SWIM API URL
 */
const SWIM_API =  environment.nodeServer + '/swim-api';

/**
 * The Acronym Translation Service replaces hard to understans acronyms or names used directly on a model's
 * source code. This service therefore provides significant labels when presenting information for end users.
 */
@Injectable({
  providedIn: 'root'
})

export class AcronymCatalogService {

  /** Holds the current acronym dictionary */
  private acronymCatalog: any;
  /** Subscription subject to the dictionary */
  private acronymCatalogUpdated = new Subject<any>();

  /** Class contructor user http client class */
  constructor(private http: HttpClient,
              @Inject(LOCALE_ID) public locale: string,
              private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Get model acronym catalog by model id and target language
   * @param modelID model identification string
   * @param lang language identification string (en-us or es-mx)
   */
  getAcronymCatalog(modelID: string, lang: string) {
    console.log('Fetching acronym catalog');
    lang = this.locale.toLowerCase();
    this.http
      .get< {message: string; result: any }>(
        SWIM_API + '/acronyms/model/' + modelID + '/lang/' + lang
      )
      .subscribe( data => {
        this.acronymCatalog = data.result;
        this.acronymCatalogUpdated.next(JSON.parse(JSON.stringify(this.acronymCatalog)));
      }, (error) => {
        console.log(error)
        this.acronymCatalog = {
          modelID : modelID,
          lang : lang,
          dictionary : {}
        };
        this.acronymCatalogUpdated.next(JSON.parse(JSON.stringify(this.acronymCatalog)));
        // this.errorHandler.handleHttpError(error);
      });
  }

  /**
   * Return acronym dictionary updated subject
   */
  getAcronymUpdateListener() {
    return this.acronymCatalogUpdated.asObservable();
  }

  /**
   * Return a copy of the acronym dictionary
   */
  getAcronymDictionary() {
    return JSON.parse(JSON.stringify(this.acronymCatalog));
  }

}
