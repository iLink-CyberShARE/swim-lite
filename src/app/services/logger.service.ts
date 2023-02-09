import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** SWIM LOGGER API URL */
const SWIM_API =  environment.nodeServer + '/swim-logger-api';

/**
 * Global Service
 */
@Injectable({
  providedIn: 'root'
})

/**
 * SWIM Logger service
 */
export class LoggerService {

  /**
   * Interface with SWIM Recommender System
   * @param http http client
   */
  constructor(private http: HttpClient) {}

  /**
   * Log an event that has occured on the UI
   * @param level level of importance
   * @param category type of event
   * @param message description of the event
   */
  LogEvent(level: number, category: number, message: string) {

    const userData: {
      email: string;
      _token: string;
      _id: number;
      _tokenExpirationDate: string;
      isGuest: boolean;
    } = JSON.parse(localStorage.getItem('userData'));

    let user = null;
    if (userData !== null) {
      user = userData._id;
    }
    const url = SWIM_API + '/eventlog';
    return this.http
    .post<{ responseData: any }>(
      url, {
        level,
        category,
        message,
        user
      }
    );
  }

  /**
   * Log into the database that a scenario submission was submitted
   * @param modelId model unique identifier
   * @param userScenarioId unique identifier of the submitted scenario
   * @param status initial status of the model scenario execution
   */
  LogExecution(modelId: string, userScenarioId: string, status: string) {
    const url = SWIM_API + '/executionlog';
    return this.http
    .post<{ responseData: any }>(
      url, {
        modelId,
        userScenarioId,
        status
      }
    );
  }

  /**
   * Updates the execution timestamps and status of the scenario entry
   * @param startTime date-time the execution started
   * @param endTime date-time the execution finished
   * @param status execution status
   */
  UpdateExecutionEntry(modelId: string, userScenarioId: string, startTime: string, endTime: string, status: string) {
    const url = SWIM_API + '/updaterunstatus';
    return this.http
    .post<{ responseData: any }>(
      url, {
        modelId,
        userScenarioId,
        startTime,
        endTime,
        status
      }
    ).subscribe( response => { });
  }

}
