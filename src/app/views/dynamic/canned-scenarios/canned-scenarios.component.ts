import { Component, OnInit, OnDestroy } from '@angular/core';
import { CannedScenariosService } from 'src/app/services/canned-scenarios.service';
import { Subscription } from 'rxjs';
import { CannedScenario } from 'src/app/models/canned-scenario.model';
import { faArchive } from '@fortawesome/free-solid-svg-icons';

/**
 * Canned Scenarios Page
 */
@Component({
  selector: 'app-canned-scenarios',
  templateUrl: './canned-scenarios.component.html',
  styleUrls: ['./canned-scenarios.component.css']
})

export class CannedScenariosComponent implements OnInit, OnDestroy  {

  faArchive = faArchive;

  /** Loading widget flag */
  isLoading = true;

  /** Subscription to chances on the canned scenarios list */
  private scenariosListSub: Subscription;

  cannedScenariosList: CannedScenario[] = [];

  /**
   * Constructor
   */
  constructor(
    private canedScenariosService: CannedScenariosService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.canedScenariosService.getAllCannedScenarios();
    this.scenariosListSub = this.canedScenariosService
      .getScenariosUpdateListener()
      .subscribe ((scenariosList: CannedScenario[]) =>  {
        this.cannedScenariosList = scenariosList;
        this.isLoading = false;
      });
  }

  /**
   * Call service to request deletion of selected canned scenario
   * @param id canned scenario identifier
   */
  onDeleteCan(id: string) {
    if (window.confirm('Are you sure you want to delete this scenario')) {
      this.isLoading = true;
      this.canedScenariosService.deleteCannedScenario(id).subscribe( response => {
        this.canedScenariosService.getAllCannedScenarios();
      }, (error) => {
        this.isLoading = false;
        console.log(error);
      });
    }
  }

  /**
   * Get cont flag from user data
   */
  getCont() {
    try {
      return JSON.parse(localStorage.getItem('userData')).isCont;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Remove subscriptions on component destroyed
   */
  ngOnDestroy() {
    this.scenariosListSub.unsubscribe();
  }

}
