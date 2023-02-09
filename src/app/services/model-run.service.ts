import { UserScenario } from '../models/user-scenario';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpClient, HttpBackend  } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { LoggerService } from './logger.service';
import { ErrorHandlerService } from './error-handler.service';
import { TouchListener } from 'ag-grid-community';
import { catchError, timeout } from 'rxjs/operators';

/** GAMS webservice endpoint */
const SWIM_GAMS =  environment.GAMSEndpoint;

/** GAMS webservice health endpoint */
const SWIM_HEALTH_GAMS = environment.GAMSHealth;

/** Scilab webservice endpoint */
const SWIM_SCILAB =  environment.ScilabEndpoint;

/** Scilab webservice health endpoint */
const SWIM_HEALTH_SCILAB = environment.ScilabHealth;

/** Python webservice health endpoint */
const SWIM_PYTHON =  environment.PythonEndpoint;

/** Python webservice endpoint  */
const SWIM_HEALTH_PYTHON = environment.PythonHealth;

/**
 * Interface with SWIM model execution services.
 */
@Injectable({
  providedIn: 'root'
})

export class ModelRunService {

  /** Model Semaphore */
  private running = false;

  /** Holds the user scenario specification */
  private modelScenario: UserScenario;

  /** Holds the user selected role */
  private userRole: string;

  /** Subscribable subject to updates on the user scenario specification */
  private modelScenarioUpdated = new Subject<UserScenario>();

  /** Descriptive text of user scenario added to the descripton field before model run */
  private scenarioDescription = '';

  /** Projection start year */
  private projectionStart = '2020'; // hardcoded for wb model -> need to move to db

  /** Scenario themes linked to this run */
  public scenarioThemes: string[] = new Array();

  /** Hide Dynamic Data Tools Flag */
  private hideTools = false;

  /** Language Index */
  public lanIndex = 0;

  /** Class constructor uses http client class */
  constructor(private http: HttpClient,
              private http2: HttpClient,
              handler: HttpBackend,
              private router: Router,
              private loggerService: LoggerService,
              @Inject(LOCALE_ID) public locale: string,
              private errorHandler: ErrorHandlerService
  ) {
    this.http2 = new HttpClient(handler);

    // temporary language index set - need to refactor this
    if (this.locale.toLowerCase() === 'es-mx') {
      this.lanIndex = 1;
    }
  }

  /**
   * Submits a model scenario for execution
   * @param modelScenario scenario specification object
   * Local Development:
   *  http://localhost:9280/runmodel --> Scilab Service
   *  http://localhost:9179/user-scenario-input --> GAMS Service
   *
   * Testing Server:
   * https://services.cybershare.utep.edu/swim-scilab/runmodel/  --> Scilab Service
   * https://services.cybershare.utep.edu/water/distribuitor/ --> GAMS Service
   *
   */
  submitModelScenario(modelScenario: UserScenario) {
    // console.log('Submitting model for execution');
    if (this.running === true) {
      // console.log('Event: Model run when other was on execution.'); // event to log
      return;
    }

    let endpointAddress = '';
    if (modelScenario.modelSettings[0].modelID === '5d8cdb841328534298eacf4a') {
      endpointAddress = SWIM_GAMS;
      modelScenario.start = '1995'; // hardcoded -> need to move this to db
    }
    else if (modelScenario.modelSettings[0].modelID === '7b7ac93638f711ec8d3d0242') {
      endpointAddress = SWIM_PYTHON;
      modelScenario.start = '1950'; // hardcoded -> need to move this to db
    }
    else {
      endpointAddress = SWIM_SCILAB;
      modelScenario.start = this.projectionStart;
    }

    this.running = true;

    // log on the database the submission of a model
    const logExecution = this.loggerService.LogExecution(modelScenario.modelSettings[0].modelID, modelScenario.id,
      modelScenario.status);
    logExecution.subscribe( (response) => { });

    // submit to model endpoint for execution
    this.http
      .post<any>(
        endpointAddress,
        modelScenario
      )
      .subscribe(response => {
          this.modelScenario = response;
          // update local projection start (temporary solution)
          if (typeof this.modelScenario.start !== 'undefined') {
            this.projectionStart = this.modelScenario.start;
          }
          // update the log entry
          this.loggerService.UpdateExecutionEntry(this.modelScenario.modelSettings[0].modelID,
            this.modelScenario.id,
            this.modelScenario.startedAtTime,
            this.modelScenario.endedAtTime,
            this.modelScenario.status);
          // sending a copy of the model scenario...
          this.modelScenarioUpdated.next(JSON.parse(JSON.stringify(this.modelScenario)));
          this.running = false;
        }, (error) => {
          this.running = false;
          // update the log entry with a failed status
          this.loggerService.UpdateExecutionEntry(modelScenario.modelSettings[0].modelID,
            modelScenario.id,
            modelScenario.startedAtTime,
            null,
            'failed');
          this.errorHandler.handleHttpError(error);
        }
      );
  }

  /**
   * Update the model scenario without triggering the observable object.
   * Used when loading saved runs from the database.
   * @param scenario custom user scenario
   */
  updateModelScenario(scenario: UserScenario) {
    this.modelScenario = scenario;
    // update local projection start (temporary solution)
    if (typeof this.modelScenario.start !== 'undefined') {
      this.projectionStart = this.modelScenario.start;
    }
  }

  /**
   * Get model outputs filtered by units, excuding one of the outputs
   * @param units units to filter the outputs by
   * @param exclude the output to exclude from the list
   */
  getAppendableList(units: string, exclude: string) {

    // get output that has the same units and excludes the selected output on the detail view
    const outputList = this.modelScenario.modelOutputs
                        .filter((output) => output.varValue.length > 1)
                        .filter((output) => output.varinfo[this.lanIndex].varUnit === units)
                        .filter((output) => output.varName !== exclude);

    // return the filtered output list
    return [...outputList];
  }

  /**
   * Get model inputs filtered by units
   * @param units  units to filter the inputs by
   */
  getAppendableInputList(units: string) {

    const inputList = this.modelScenario.modelInputs
                        .filter((input) => input.paraminfo[this.lanIndex].paramUnit === units)
                        .filter((input) => input.structType !== 'scalar');
    // return the filtered input list
    return [...inputList];
  }

  /**
   * Update the model scenario description
   * @param description description to append
   */
  updateModelDescription(description: string) {
    this.modelScenario.description = description;
    this.modelScenarioUpdated.next(JSON.parse(JSON.stringify(this.modelScenario)));
  }

  /**
   * Get the id of the executed user scenario
   * @returns the id of the current executed scenario
   */
  getScenarioID() {
    return this.modelScenario.id;
  }

  /**
   * Get the name of the scenario
   */
  getScenarioName() {
    return this.modelScenario.name;
  }

  /**
   * Get the id of the currently loaded model
   * @returns the id of the current model
   */
  getModelID() {
    return this.modelScenario.modelSettings[0].modelID;
  }

  /**
   * Scenario update observable object
   * @returns observable scenario updated object
   */
  getScenarioUpdateListener() {
    return this.modelScenarioUpdated.asObservable();
  }

  /**
   * Sets user scenario description
   * @param description description text
   */
  setScenarioDescription(description: string) {
    this.scenarioDescription = description;
  }

  /**
   * Gets current user scenario description text
   */
  getScenarioDescription() {
    if (this.scenarioDescription !== '') {
      return this.scenarioDescription;
    } else {
      if (typeof this.modelScenario !== 'undefined') {
        return '';
      } else {
        return '';
      }
    }
  }

  resetScenarioDescription() {
    this.scenarioDescription = '';
    if (typeof this.modelScenario !== 'undefined') {
        this.modelScenario.description = '';
    }
  }

  /**
   * sets the role of the user
   * @param role role string
   */
  setUserRole(role: string) {
    this.userRole = role;
  }

  /**
   * gets the role of the user
   */
  getUserRole() {
    return this.userRole;
  }

  /**
   * Append the scenario themes selected for this run
   * @param themeID unique theme identier
   */
  appendScenarioTheme(themeID: string) {
    this.scenarioThemes.push(themeID);
  }

  /**
   * Returns list of scenario themes linked to this model
   */
  getScenarioThemes() {
    return this.scenarioThemes;
  }

  /**
   * Returns the dynamic tool status
   */
  getToolStatus() {
    return this.hideTools;
  }

  /**
   * returns start date of projection included in the user scenario spec.
   * To use on output details
   */
  getProjectionStart() {
    return this.modelScenario.start;
  }

  /**
   * returns the start date of projection locally set on the service,
   * not on the scenario spec before the run.
   * To use on theme learn more and input details.
   */
  getProjectionStartInner() {
    return this.projectionStart;
  }

  /** set projection start date */
  setProjectionStart(start: string) {
    this.projectionStart = start;
  }

  /**
   * Hide or show flag for dynamic tools on the output details
   * @param hide if the tools should be hidden or not
   */
  setToolStatus(hide: boolean) {
    this.hideTools = hide;
  }

  /**
   * Ping a model service
   * @param modelID model unique identifier
   */
  modelServicePing(modelID: string) {
    let endpointAddress = '';
    if (modelID === '5d8cdb841328534298eacf4a') {
      endpointAddress = SWIM_HEALTH_GAMS;
    }
    else if (modelID === '7b7ac93638f711ec8d3d0242') {
      endpointAddress = SWIM_HEALTH_PYTHON;
    }
    else {
      endpointAddress = SWIM_HEALTH_SCILAB;
    }

    this.http2.get(
      endpointAddress, {responseType: 'text'}
    ).pipe(
      timeout(2000),
      catchError(e => {
        this.errorHandler.handleMessageError('The model service is not available at this time');
        return of(null);
      }))
    .subscribe(
      (response) => {
      const answer = response.trim();
      if (!answer.includes('pong')) {
        this.router.navigate(['/error-page', 'Model execution service not available at this time.']);
      }
    }, (error) => {
        this.errorHandler.handleMessageError('The model service is currently unavailable.');
      });

  }

}
