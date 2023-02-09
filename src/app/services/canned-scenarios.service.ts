import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CannedScenario } from '../models/canned-scenario.model';
import { ErrorHandlerService } from './error-handler.service';

/**
 * SWIM API URL
 */
const SWIM_API = environment.nodeServer + '/swim-api';

/**
 * CannedScenario Service
 */
@Injectable({
  providedIn: 'root'
})

export class CannedScenariosService {

  /** Hols list of all canned scenarios */
  private cannedScenarios: CannedScenario[] = [];

  /** Subject to subscribe to canned scenario list changes  */
  private cannedScenariosUpdated = new Subject<CannedScenario[]>();

  /** Class constructor */
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService) {}


  /**
   * Get all canned scenarios
   */
  getAllCannedScenarios() {
    console.log('Fetching Available Canned Scenarios');
    this.http
    .get<{ message: string; result: any }>(
      SWIM_API + '/cans'
    )
    .pipe(
      map(scenarioData => {
        return scenarioData.result.map(scenarioCatalog => {
          return {
            _id: scenarioCatalog._id,
            name: scenarioCatalog.name,
            description: scenarioCatalog.description,
          };
        });
      })
    )
    .subscribe(transformedCatalog => {
      this.cannedScenarios = transformedCatalog;
      this.cannedScenariosUpdated.next([...this.cannedScenarios]);
    }, (error) => {
      this.errorHandler.handleHttpError(error);
    });

  }

  /**
   * Get canned scenario by id
   * @param id canned scenario id
   */
  getCannedScenario(id: string) {
    console.log('Fetching Canned Scenario');
    return this.http.get<{ message: string; result: any }>(SWIM_API + '/cans/' + id);
  }

  /**
   * TODO: Protect this method and add error handler
   * Inserts a can scenario on the database
   * @param can cannned scenario specification
   */
  insertCannedScenario(can: CannedScenario) {
    console.log('Inserting canned scenario');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.post<any>(SWIM_API + '/cans/insert', can, httpOptions);
  }

  /**
   * Deletes a canned scenario specification from the database.
   * User needs to have content management access level.
   * @param id canned scenario identifier
   */
  deleteCannedScenario(id: string) {
    console.log('Deleting canned scenario');
    return this.http
    .delete<{ message: string; }>(
      SWIM_API + '/cans/delete/' + id
    );
  }

  /**
   * Get scenario list listener
   */
  getScenariosUpdateListener() {
    return this.cannedScenariosUpdated.asObservable();
  }

}
