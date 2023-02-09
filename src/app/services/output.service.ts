import { ModelOutput } from '../models/output.model';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

/** SWIM API URL */
const SWIM_API =  environment.nodeServer + '/swim-api';

/**
 * Interface with SWIM model output catalog
 */
@Injectable({
  providedIn: 'root'
})

export class OutputService {

  /** List of outputs to filter results by */
  private include: Array<string>;

  /** Holds the output catalog of a selected model */
  private outputCatalog: ModelOutput[] = [];

  /** Subscribable subject for when the output catalog changes */
  private outputCatalogUpdated = new Subject<ModelOutput[]>();

  /** Language Index */
  public lanIndex = 0;

  /** Class constructor uses http client services */
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string,
    private errorHandler: ErrorHandlerService) {}

  /**
   * Get all outputs by model id and keep locally
   * @param modelId model identification string
   */
  getOutputCatalog(modelId: string) {
    console.log('Fetching Output Catalog');
    this.http
    .get<{ message: string; result: ModelOutput[] }>(
      SWIM_API + '/outputs/model/' +  modelId
    )
    .subscribe(data => {
      this.outputCatalog = [];
      if (this.include.length > 0) {
        data.result.forEach(item => {
          if (this.include.includes(item.varName)) {
            this.outputCatalog.push(item);
          }
        });
      } else {
        this.outputCatalog = data.result;
      }
      this.setLangIndex();
      this.outputCatalogUpdated.next([...this.outputCatalog]);
    }, (error) => {
      this.errorHandler.handleHttpError(error);
    });
  }

  /**
   * Set the output catalog externally
   * @param outputs list of outputs
   */
  setOutputCatalog(outputs: ModelOutput[]) {
    this.outputCatalog = outputs;
    this.setLangIndex();
    this.outputCatalogUpdated.next([...this.outputCatalog]);
  }

  /**
   * Get an output by name from local run
   * @param name string name identifier
   */
  getOutputByName(name: string) {
    return this.outputCatalog.find(a => a.varName === name);
  }

  /**
   * Get model specific model outputs from a model scenario
   * @param scenarioid target scenario id
   * @param outputids array of variable names to search for
   */
  getOutputDatabyScenario(scenarioid: string , outputids: string[]) {
    // TODO: finish this function
  }

  /**
   * TODO
   * Add an output to the catalog
   */
  addOutput() {}

  /**
   * Update an output on the catalog
   */
  updateOutput() {}

  /**
   * TODO
   * Mark an output for deletion on the catalog
   */
  deleteOutput() {}

  /**
   * Get the catalog updated subject.
   */
  getOutputUpdateListener() {
    return this.outputCatalogUpdated.asObservable();
  }

  /**
   * Limits the outputs to fetch from the model
   * @param outputs list of output names to be included
   */
  setIncludes(outputs: Array<string>) {
    this.include = [...outputs];
    console.log(this.include);
  }

  /**
   * Clears the output filter list
   */
  resetFilter() {
    this.include = [];
  }

  /**
   * Set the index of the current language or locale
   */
  private setLangIndex() {
    try {
      const targetLang = this.locale.toLowerCase();
      // targetLang = 'es-mx'; // for testing only
      const keys = this.outputCatalog[0].varinfo.filter(info => info.lang === targetLang)[0];
      this.lanIndex = this.outputCatalog[0].varinfo.indexOf(keys);
      if ( this.lanIndex >= 0) {
        return;
      } else {
        this.lanIndex = 0;
      }
    } catch (error) {
      this.lanIndex = 0;
      this.errorHandler.handleAngularError(error);
      return;
    }
  }

}
