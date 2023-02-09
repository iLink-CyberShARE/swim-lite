import { Parameter } from '../models/parameter.model';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

/** SWIM API URL */
const SWIM_API =  environment.nodeServer + '/swim-api';

/**
 * Interface with SWIM model input catalog (parameters)
 */
@Injectable({
  providedIn: 'root'
})

export class ParameterService {

  /** Parameter catalog from a specific model */
  private parameterCatalog: Parameter[] = [];

  /** Subscribable subject for when the catalog changes */
  private parameterCatalogUpdated = new Subject<Parameter[]>();

  /** Subscribable subject from when  parameter metadata in the catalog is changed */
  private parameterMetadataUpdated = new Subject<any>();

  /** Language Index */
  public lanIndex = 0;

  /** Class constructor uses http client and router classes */
  constructor(private http: HttpClient,
              private errorHandler: ErrorHandlerService,
              @Inject(LOCALE_ID) public locale: string) {}

  /**
   *  Get parameters by model id
   * @param modelId model identifier
   */
  getParameterCatalog(modelId: string) {
    console.log('Fetching Parameter Catalog');
    this.http
      .get<{ message: string; result: Parameter[] }>(
        SWIM_API + '/parameters/model/' + modelId
      )
      .subscribe(data => {
        this.parameterCatalog = data.result;

        // set the target information language
        this.setLangIndex();

        // copy the default value to the value object
        for (const parameter of this.parameterCatalog) {
          parameter.paramValue = JSON.parse(JSON.stringify(parameter.paramDefaultValue));
        }

        this.parameterCatalogUpdated.next([...this.parameterCatalog]);
      }, (error) => {
        this.errorHandler.handleHttpError(error);
      });
  }

  /**
   * Defines the parameter catalog from outside
   * No fetching from the server
   * @param parameters list of parameters
   */
  setParameterCatalog(parameters: Parameter[]) {
    this.parameterCatalog = parameters;
    this.setLangIndex();
    this.parameterCatalogUpdated.next([...this.parameterCatalog]);
  }

  /**
   * Update the value of a target parameter (model input)
   * @param name unique name of the parameter
   * @param value new value (dataset)
   */
  updateParamValue(name: string, value: any) {
    let targetParameter: Parameter = null;
    targetParameter = this.parameterCatalog.filter(parameter => parameter.paramName === name)[0];
    targetParameter.paramValue = JSON.parse(JSON.stringify(value));
  }

  /**
   * Returns metadata by parameter name, does not include set or default values
   * @param name paramName - name identifier for the paramater
   */
  getParameterMetaByName(name: string) {
    return this.parameterCatalog.filter(parameter => parameter.paramName === name)[0];
  }

  /**
   * TODO
   * Add a parameter document to the input catalog
   */
  addParameter() {}

  /**
   * TODO
   * Update a paramater object in the input catalog
   */
  updateParameter() {}

  /**
   * TODO
   * Mark a parameter document for removal
   */
  deleteParameter() {}

  /**
   * Get parameter catalog changes observable object
   */
  getParameterUpdateListener() {
    return this.parameterCatalogUpdated.asObservable();
  }

  /**
   * Get parameter metadata changes observable object
   */
  getParameterMetaListener() {
    return this.parameterMetadataUpdated.asObservable();
  }

  /** set the index for the current language */
  private setLangIndex() {
    try {
      const targetLang = this.locale.toLowerCase();
      // targetLang = 'es-mx'; // for testing only
      const keys = this.parameterCatalog[0].paraminfo.filter(info => info.lang === targetLang)[0];
      this.lanIndex = this.parameterCatalog[0].paraminfo.indexOf(keys);
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
