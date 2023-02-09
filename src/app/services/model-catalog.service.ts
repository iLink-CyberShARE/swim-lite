import { ModelCatalog } from '../models/model-catalog.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

/**
 * SWIM API URL
 */
const SWIM_API =  environment.nodeServer + '/swim-api';

/**
 * The Model Catalog service fetches metadata regarding a specific
 * scientific model available in SWIM
 */
@Injectable({
  providedIn: 'root'
})

export class ModelCatalogService {

  /** Holds list of model metadata objects */
  private modelCatalog: ModelCatalog[] = [];

  /** Subject to subscribe when the model list changes */
  private modelCatalogUpdated = new Subject<ModelCatalog[]>();

  /** Class constructor */
  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) {}

  /**
   * Gets complete model catalog from mongo db
   */
  getModelCatalog() {
    console.log('Fetching Model Catalog');
    this.http
      .get<{ message: string; result: any }>(
        SWIM_API + '/model-catalog'
      )
      .pipe(
        map(modelData => {
          return modelData.result.map(modelCatalog => {
            return {
              id: modelCatalog._id,
              modelName: modelCatalog.modelName,
              modelDescription: modelCatalog.modelDescription,
              dateCreated: new Date(modelCatalog.dateCreated),
              dateModified: new Date(modelCatalog.dateModified),
              softwareAgent: modelCatalog.softwareAgent,
              license: modelCatalog.license,
              version: modelCatalog.version,
              sponsor: modelCatalog.sponsor,
              creators: modelCatalog.creators,
              hostServer: modelCatalog.hostServer,
              serviceInfo: modelCatalog.serviceInfo,
            };
          });
        })
      )
      .subscribe(transformedCatalog => {
        this.modelCatalog = transformedCatalog;
        this.modelCatalogUpdated.next([...this.modelCatalog]);
      }, (error) => {
        this.errorHandler.handleHttpError(error);
      });
  }

  /**
   * Get model metadata by id
   * @param id model id
   */
  getModel(id: string) {
    console.log('Fetching Model Metadata');
    return this.http
      .get<{ result: any }>(
        SWIM_API + '/model-catalog/' + id
      );
  }

  /**
   * TODO
   * Adds a new model metadata set to the platform.
   */
  addModel() {}

  /**
   * TODO
   * Updates metadata of a specific registered model.
   */
  updateModel() {}

  /**
   * TODO
   * Marks a SWIM model as removed from the SWIM platform
   */
  deleteModel() {}

  /**
   * Return catalog updated subject
   * @returns observable object of catalog updates
   */
  getCatalogUpdateListener() {
    return this.modelCatalogUpdated.asObservable();
  }

}
