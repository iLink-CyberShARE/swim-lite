import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModelOutput } from 'src/app/models/output.model';
import { CustomScenariosService } from 'src/app/services/custom-scenarios.service';
import { CannedScenario } from 'src/app/models/canned-scenario.model';
import { CannedScenariosService } from 'src/app/services/canned-scenarios.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-can-dialog',
  templateUrl: './can-dialog.component.html',
  styleUrls: ['./can-dialog.component.css']
})
export class CanDialogComponent implements OnInit {

  /** Language index */
  lanIndex = 0;

  /** Loading widget dialog */
  isLoading = true;

  /** List of outputs available on the selected scenario */
  outputList: ModelOutput[];

  /** Canned scenario name */
  name = '';

  /** Canned scenario description */
  description = '';

  /** Hide tools flag */
  hideTools = false;

  /** Model source identifier */
  private modelID = '';

  /** Creation Response */
  response = '';

  /** response class */
  responseClass = '';

  /** List of selected output to show on the canned scenario */
  selectedOutputList: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CanDialogComponent>,
    private customScenarioService: CustomScenariosService,
    private cannedScenarioService: CannedScenariosService,
    @Inject(MAT_DIALOG_DATA) public scenarioID: string,
    @Inject(LOCALE_ID) public locale: string
  ) {
    const targetLang = this.locale.toLowerCase();
    if (targetLang === 'es-mx') {
      this.lanIndex = 1;
    }
   }

  ngOnInit() {
    this.isLoading = true;

    // query scenario run by id
    this.customScenarioService.GetScenario(this.scenarioID).
    subscribe((response: any) => {
      // assign the output list to show on this scenario
      this.outputList = response.result.modelOutputs;
      this.modelID = response.result.modelSettings[0].modelID;
      this.isLoading = false;
    });
  }

  /**
   * Submit options for creation of canned scenario
   */
  onCreate() {
    try {
      this.isLoading = true;
      const canScenario: CannedScenario = {
        _id: uuid.v4(),
        name: this.name,
        description: this.description,
        modelID: this.modelID,
        hideTools: this.hideTools,
        scenarioID: this.scenarioID,
        outputFilter : []
      };

      // populate output filters
      for (const output of this.selectedOutputList) {
        canScenario.outputFilter.push(output);
      }

      console.log(canScenario.hideTools);

      // submit to create canned scenario endpoint
      this.cannedScenarioService.insertCannedScenario(canScenario)
        .subscribe((result) => {
          if (result.message === 'OK') {
            this.response = 'Canned scenario created successfully!';
            this.responseClass = 'response-ok';
          }
        }, (error) => {
          this.response = 'Error creating canned scenario...';
          this.responseClass = 'response-error';
        });

      // handle response here
      this.isLoading = false;
    } catch (error) {
      this.response = error;
      this.isLoading = false;
    }
  }

  /**
   * Closes the dialog and cancels the submission of the scenario.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

}
