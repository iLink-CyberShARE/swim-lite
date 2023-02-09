import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject, forkJoin } from "rxjs";
import { environment } from "../../environments/environment";
import { UserScenario } from "../models/user-scenario";
import { ErrorHandlerService } from "./error-handler.service";

/**
 * SWIM API URL
 */
const SWIM_API = environment.nodeServer + "/swim-api";

/**
 * Custom Scenarios Service
 * Fetches public and user scenarios metadata
 */
@Injectable({
  providedIn: "root",
})
export class CustomScenariosService {
  /** Holds the model scenarios */
  private scenarioList: UserScenario[] = [];

  /** Scenario List Subscriber */
  private scenarioListUpdated = new Subject<UserScenario[]>();

  /** Class constructor */
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Get All public scenarios metadata
   */
  GetPublicScenarios() {
    // console.log('Fetching Public Scenarios Metadata');
    this.http
      .get<{ message: string; result: UserScenario[] }>(
        SWIM_API + "/executions/public"
      )
      .subscribe(
        (data) => {
          this.scenarioList = data.result;
          this.scenarioListUpdated.next([...this.scenarioList]);
        },
        (error) => {
          this.errorHandler.handleHttpError(error);
        }
      );
  }

  /**
   * Get a user model scenario by id
   * @param id user scenario key identifier
   */
  GetScenario(id: string) {
    console.log("Fetching scenario by id...");
    return this.http.get<{ message: string; result: any }>(
      SWIM_API + "/executions/runs/" + id
    );
  }

  /**
   * Get scenarios from the logged in user
   */
  GetMyScenarios() {
    console.log("Fetching Private Scenarios Metadata");
    this.http
      .get<{ message: string; result: UserScenario[] }>(
        SWIM_API + "/executions/private"
      )
      .subscribe(
        (data) => {
          this.scenarioList = data.result;
          this.scenarioListUpdated.next([...this.scenarioList]);
        },
        (error) => {
          // change to a page as not found
          this.errorHandler.handleHttpError(error);
        }
      );
  }

  /**
   * Delete my scenario by id
   */
  DeleteMyScenario(id: string) {
    console.log("Removing Scenario");
    return this.http.delete<{ message: string; result: any }>(
      SWIM_API + "/executions/delete/" + id
    );
  }

  /**
   * Get metadata of model scenarios by model id
   * @param modelid model id filter
   */
  GetPublicScenariobyModel(modelid: string) {
    console.log("Retrieving scenarios by model id");
    return this.http.get<{ message: string; result: any[] }>(
      SWIM_API + "/executions/public-meta/bymodel/" + modelid
    );
  }

  /**
   * Get metadata of user private scenarios by model id
   * @param modelid model id filter
   */
  GetPrivateScenariobyModel(modelid: string) {
    console.log("retrieving private scenarios by model id");
    return this.http.get<{ message: string; result: any[] }>(
      SWIM_API + "/executions/private-meta/bymodel/" + modelid
    );
  }

  /**
   * Get information for cross compare public scenarios
   * @param scenarioids list of selected scenario identifiers
   * @param outputnames list of selected model outputs
   */
  GetCrossScenarios(scenarios: any, outputs: any) {
    console.log("retrieving cross compare outputs");
    const endpointAdress = SWIM_API + "/executions/cross-scenarios";
    const data = {
      scenarioids: scenarios,
      outputnames: outputs,
    };
    // console.log(data);
    return this.http.post<any>(endpointAdress, data);
  }

  /**
   * Get both public and private results
   */
  GetCrossScenarios2(scenarios: any, outputs: any) {
    console.log("retrieving public and private cross compares");
    const publicEndpoint = SWIM_API + "/executions/cross-scenarios";
    const privateEndpoint = SWIM_API + "/executions/private-cross-scenarios";
    const data = {
      scenarioids: scenarios,
      outputnames: outputs,
    };
    const publicResponse = this.http.post<any>(publicEndpoint, data);
    const privateResponse = this.http.post<any>(privateEndpoint, data);
    return forkJoin([publicResponse, privateResponse]);
  }

  /**
   * Get information for cross compare private scenarios
   * @param scenarios list of selected scenario identifiers
   * @param outputs list of selected model outputs
   */
  GetPrivateCrossScenarios(scenarios: any, outputs: any) {
    console.log("retrieving cross compare outputs");
    const endpointAdress = SWIM_API + "/executions/private-cross-scenarios";
    const data = {
      scenarioids: scenarios,
      outputnames: outputs,
    };
    // console.log(data);
    return this.http.post<any>(endpointAdress, data);
  }

  /**
   * Get observable subject for scenario list
   */
  GetScenarioListListener() {
    return this.scenarioListUpdated.asObservable();
  }

  /******** Hydroshare Metadata Endpoints (maybe move these) */

  /**
   * Insert Hydroshare metadata linked to a swim scenario
   * @param scenario_id
   * @param hs_id
   * @param hs_url
   * @param hs_type
   * @returns
   */
  InsertHSMeta(
    scenario_id: string,
    hs_id: string,
    hs_url: string,
    hs_type: string
  ) {
    console.log("Inserting HS Metadata....");

    const endpointAddress = SWIM_API + "/hs/insert";

    const payload = {
      scenario_id: scenario_id,
      hs_id: hs_id,
      hs_url: hs_url,
      hs_type,
    };

    return this.http.post<any>(endpointAddress, payload).subscribe(
      (response) => {
        console.log(response.message);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /**
   * Get a scenario_id from a linked hydroshare id
   * @param hs_id
   */
  GetScenarioId(hs_id: string) {
    console.log("Fetching scenario_id by hs_id...");

    const endpointAddress = SWIM_API + "/hs/by_hs/";

    return this.http.get<{ message: string; result: any[] }>(
      endpointAddress + hs_id
    );

  }
}
