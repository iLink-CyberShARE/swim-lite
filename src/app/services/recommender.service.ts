import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { Role } from '../models/role.model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';
import { CATCH_STACK_VAR } from '@angular/compiler/src/output/output_ast';

/** SWIM Recommender Endpoint */
const SWIM_RECOMMENDER =  environment.RecommenderEndpoint;

/**
 * Global Service
 */
@Injectable({
  providedIn: 'root'
})

/**
 * Interface with SWIM Recommender System
 */
export class RecommenderService {

  /** Item List */
  private itemList: Item[] = [];

  /** Item list updated subject */
  private itemListUpdated = new Subject<Item[]>();

  /** Role List */
  private roleList: Role[] = [];

  /** Role list updated subject */
  private roleListUpdated = new Subject<Role[]>();

  /** Recommendation List */
  private recommendedList: any[] = [];

  /**
   * Interface with SWIM Recommender System
   * @param http http client
   */
  constructor(private http: HttpClient,
              private errorHandler: ErrorHandlerService) {}

  /**
   * Performs an evaluation of a target recommendation model with a score response
   * that ranges between 0 and 1.
   * The default method used is precision_k.
   * @param modelId model unique identifier
   * @param method name of the evaluation method to use
   */
  evaluateModel(modelId: string, method: string) {
    const url = SWIM_RECOMMENDER + '/recommender/evaluate';
    const payload = {
      model_id: modelId,
      k: 10,
    };
    return this.http
    .post<any>(
      url,
      payload
    );
  }

  /**
   * Retrieves an ordered list of recommended model outputs for a specific user role
   * The response list is sorted by output rank value.
   * @param roleId role unique identifier
   * @param modelId model unique identifer
   * @param numItems number of top outputs to recommend
   */
  getRoleRecommendation(roleId: number, modelId: string, numItems: number) {
    const url = SWIM_RECOMMENDER + '/recommender/request/byrole';
    const payload = {
      role_id: roleId,
      model_id: modelId,
      num_items: numItems
    };
    return this.http
    .post<any>(
      url,
      payload
    );
  }

  /**
   * Retrieves an ordered list of recommended model outputs for a specific user role
   * The response list is sorted by output rank value.
   * @param roleId role unique identifier
   * @param modelId model unique identifer
   * @param numItems number of top outputs to recommend
   */
  getRoleRecommendation2(roleId: number, modelId: string, numItems: number){
    const url = SWIM_RECOMMENDER + '/recommender/request/byrole';
    this.recommendedList = [];
    const payload = {
      role_id: roleId,
      model_id: modelId,
      num_items: numItems
    };
    this.http.post<any>(url,payload).subscribe((response) => {
      this.recommendedList = response['items'];
    }, (error) => {
      this.errorHandler.handleAngularError(error);
    });
  }

  /**
   * Get a listing of all user roles registered on the recommender system.
   */
  getRoleList() {
    // console.log('Fetching recommender roles...')
    const url = SWIM_RECOMMENDER + '/recommender/db/role/';
    this.http
    .get<{data: Role[]}>(url)
    .subscribe ( result => {
      this.roleList = result.data;
      this.roleListUpdated.next([...this.roleList]);
    }, (error) => {
      this.errorHandler.handleAngularError(error);
    });
  }

  /**
   * Get a listing of all model outputs registered on the recommender system.
   */
  getOutputList() {
    // console.log('Fetching recommender items...')
    const url = SWIM_RECOMMENDER + '/recommender/db/item/';
    this.http
    .get<{data: Item[]}>(url)
    .subscribe ( result => {
      this.itemList = result.data;
      this.itemListUpdated.next([...this.itemList]);
    }, (error) => {
      this.errorHandler.handleAngularError(error);
    });
  }

  /**
   * Get the unique identifier of the role name directly from recommender endpoint
   * @param roleName unique name of the target role
   */
  getRoleID(roleName: string) {
    const url = SWIM_RECOMMENDER + '/recommender/db/role/rolename/';
    return this.http
    .get<{status: string, data: any}>(
      url + roleName
    );
  }

  /**
   * Fetches the unique id of a role from the local role list
   * @param roleName role name label
   */
  getLocalRoleID (roleName : string) {
    try{
      return this.roleList.find(r => r.name === roleName).id;
    }
    catch(e){
      return null;
    }
  }

  /**
   * Get the unique identifier by global unique identifier from recommender endpoint.
   * @param guid global unique identifier value.
   *
   */
  getOutputID(guid: string) {
    const url = SWIM_RECOMMENDER + '/recommender/db/item/guid/';
    return this.http
    .get<{status: string, data: any}>(
      url + guid
    );
  }

  /**
   * Get the unique identifer from local storage of output item listing
   * @param guid output global unique identifer
   */
  getLocalOutputID(name: string) {
    try {
      const itemList = this.itemList.find(i => i.name === name).id;
      return itemList
    }
    catch(e){
      return null;
    }

  }

  /**
   * Saves an implicit interaction into the recommender system database
   * @param outputGuid global unique identifier of the item
   * @param runId model execution id related to the interaction
   * @param role user role/perspective
   */
  logImplicitFeedback(outputName: string, runId: string, roleName: string) {
    const url = SWIM_RECOMMENDER + '/recommender/db/implicit/';



    // get user id from local cookie
    const userData: {
      email: string;
      _token: string;
      _id: number;
      _tokenExpirationDate: string;
      isGuest: boolean;
    } = JSON.parse(localStorage.getItem('userData'));
    const userId = userData._id;

    // get role id
    const roleId = this.getLocalRoleID(roleName);
    if (roleId === null){
      console.log('canceled implicit feedback call');
      return;
    }

    // get item id
    const itemId = this.getLocalOutputID(outputName);
    if (itemId === null){
      console.log('canceled implicit feedback call');
      return;
    }

    // prepare data payload
    const implicitEntry = {
      item_id: itemId,
      user_id: userId,
      run_id: runId,
      role_id: roleId
    }

    // submit to implicit logger endpoint
    this.http
      .post<any>(
        url,
        implicitEntry
      )
      .subscribe (response => {
        // console.log(response);
      }, (error) => {
        this.errorHandler.handleAngularError(error);
      });
  }


  /**
   * Adds an explicit feedback entry into the recommender service database
   * @param outputName unique item name
   * @param rank rank value from 1 to 5
   * @param runId model execution linked to this feedback
   * @param roleName noame of the selected user role or perspective
   */
  logExplicitFeedback(outputName: string, rank: number, runId: string, roleName:string) {
    const url = SWIM_RECOMMENDER + '/recommender/db/explicit/';

    // get user id from local cookie
    const userData: {
      email: string;
      _token: string;
      _id: number;
      _tokenExpirationDate: string;
      isGuest: boolean;
    } = JSON.parse(localStorage.getItem('userData'));
    const userId = userData._id;

    // get role id
    const roleId = this.getLocalRoleID(roleName);

    // get item id
    const itemId = this.getLocalOutputID(outputName);

    // prepare data payload
    const explicitEntry = {
      item_id: itemId,
      rank_value: rank,
      user_id: userId,
      run_id: runId,
      role_id: roleId
    }

    // submit to explicit logger endpoint
    this.http
      .post<any>(
        url,
        explicitEntry
      )
      .subscribe (response => {
        // console.log(response);
      }, (error) => {
        this.errorHandler.handleAngularError(error);
      });
  }


  getRecommendationList() {
    return this.recommendedList;
  }

  /**
   * Get role list updated subject
   */
  getRoleUpdateListener() {
    return this.roleListUpdated.asObservable();
  }

  /**
   * Get the item list updated subject
   */
  getItemUpdateListener() {
    return this.itemListUpdated.asObservable();
  }

}
