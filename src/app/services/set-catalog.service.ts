import { Set } from '../models/set.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';


/** SWIM API URL */
const SWIM_API =  environment.nodeServer + '/swim-api';

/**
 * Catalog of set definitions used in a GAMS model
 */
@Injectable({
  providedIn: 'root'
})

export class SetCatalogService {

  /** Set listing */
  private setCatalog: Set[] = [];

  /** Set catalog updated subject */
  private setCatalogUpdated = new Subject<Set[]>();

  /** Class constructor uses http client */
  constructor(private http: HttpClient, private router: Router, private errorHandler: ErrorHandlerService) {}

  /**
   *  Get sets by model id
   * @param modelId model identifier
   */
  getSetCatalog(modelId: string) {
    console.log('Fetching set Catalog');
    this.http
      .get<{ message: string; result: Set[] }>(
        SWIM_API + '/sets/model/' + modelId
      )
      .subscribe(data => {
        this.setCatalog = data.result;
        this.setCatalogUpdated.next([...this.setCatalog]);
      }, (error) => {
        this.errorHandler.handleHttpError(error);
      });
  }

  /**
   * Establishes a set catalog without fetching from the server
   * @param sets sets to copy
   */
  setSetCatalog(sets: Set[]) {
    if (typeof sets !== 'undefined') {
      this.setCatalog = sets;
      this.setCatalogUpdated.next([...this.setCatalog]);
    } else {
      this.setCatalogUpdated.next(null);
    }
  }

  /**
   * Updates the value of a specific model set
   * @param name target set
   * @param value updates value
   */
  updateSetValue(name: string, value: string) {
    try {
      let targetSet: Set = null;
      targetSet = this.setCatalog.filter(set => set.setName === name)[0];
      targetSet.setValue = value;
    } catch (error) {
      this.errorHandler.handleAngularError(error);
    }
  }

  /**
   * Get set updated subject
   */
  getSetUpdateListener() {
    return this.setCatalogUpdated.asObservable();
  }

}
