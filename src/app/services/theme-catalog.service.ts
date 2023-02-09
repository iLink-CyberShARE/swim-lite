import { Theme } from '../models/theme.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inject, LOCALE_ID } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';

/** SWIM API URL */
const SWIM_API =  environment.nodeServer + '/swim-api';

/**
 * Scenario theme catalog service
 */
@Injectable({
  providedIn: 'root'
})

export class ThemeCatalogService {

  /** Theme listing */
  private themeCatalog: Theme[] = [];

  /** Theme catalog updated subject */
  private themeCatalogUpdated = new Subject<Theme[]>();

  /** Class contructor uses http client */
  constructor(private http: HttpClient,
              private errorHandler: ErrorHandlerService,
              @Inject(LOCALE_ID) public locale: string) {
  }

  /** Language Index */
  public lanIndex = 0;

  /**
   * Get scenario themes by model id
   * @param modelId model identifier
   */
  getThemeCatalog(modelId: string) {
    try{
      console.log('Fetching theme catalog');
      this.http
        .get<{message: string; result: Theme[]}>(
          SWIM_API + '/themes/model/' + modelId
        )
        .subscribe( data => {
          this.themeCatalog = data.result;
          this.setLangIndex();
          this.themeCatalogUpdated.next([...this.themeCatalog]);
        }, (error) => {
          // console.log(error)
          this.themeCatalog = [];
          this.setLangIndex();
          this.themeCatalogUpdated.next([...this.themeCatalog]);
          // this.errorHandler.handleHttpError(error);
        });
    }
    catch(error){
      console.log(error);
    }
  }

  /**
   * Reset selected theme
   */
  resetThemeSelected(category: string) {
    for (const theme of this.themeCatalog) {
      if (theme !== null && theme.info[this.lanIndex].category === category) {
        theme.isSelected = false;
      }
    }
  }

  /**
   * Resets selection on all scenario themes
   */
  resetAllSelections() {
    for (const theme of this.themeCatalog) {
        theme.isSelected = false;
    }
  }

  /**
   * set selected theme
   */
  setSelected(id: string) {
    for (const theme of this.themeCatalog) {
      if (theme !== null) {
        theme.isSelected = false;
      }
      if (theme._id === id) {
        theme.isSelected = true;
      }
    }
  }

  /**
   * set selected theme
   * this version is used for previous run themes
   */
  setSelected2(id: string) {
    for (const theme of this.themeCatalog) {
      if (theme._id === id) {
        theme.isSelected = true;
      }
    }
  }

  /**
   * Get theme catalog updated subject
   */
  getThemeUpdateListener() {
    return this.themeCatalogUpdated.asObservable();
  }

  /** set the index for the current language */
  private setLangIndex() {
    try {
      const targetLang = this.locale.toLowerCase();
      // targetLang = 'es-mx'; // for testing only
      const keys = this.themeCatalog[0].info.filter(info => info.lang === targetLang)[0];
      this.lanIndex = this.themeCatalog[0].info.indexOf(keys);
      if ( this.lanIndex >= 0) {
        return;
      } else {
        this.lanIndex = 0;
      }
    } catch (error) {
      this.lanIndex = 0;
      console.log(error);
      this.errorHandler.handleAngularError(error);
      return;
    }
  }

}
