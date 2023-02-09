import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// Data models
import { Theme } from '../../../models/theme.model';

// Services
import { ParameterService } from '../../../services/parameter.service';
import { ThemeCatalogService } from '../../../services/theme-catalog.service';
import { ThemeDetailComponent } from '../theme-detail/theme-detail.component';
import { SetCatalogService } from '../../../services/set-catalog.service';
import { ModelRunService } from 'src/app/services/model-run.service';

/** Box of user selectable scenario theme */
@Component({
  selector: 'app-scenario-theme',
  templateUrl: './scenario-theme.component.html',
  styleUrls: ['./scenario-theme.component.css']
})

export class ScenarioThemeComponent implements OnInit {

  /** The theme choice to see on this box */
  @Input() themeChoice: Theme;
  @Input() langIndex: number;

  /** Flag to enable or disable the show related data button */
  showDataButton = false;

  /**
   * Scenario theme class contructor
   * @param parameterService the paramater service
   * @param themeCatalogService the theme catalog service
   * @param setCatalogService the set catalog service
   * @param dialog can invoke dialog boxes
   */
  constructor(
    public parameterService: ParameterService,
    public themeCatalogService: ThemeCatalogService,
    public setCatalogService: SetCatalogService,
    private modelRunService: ModelRunService,
    public dialog: MatDialog
    ) { }

  /**
   * Class initialization function, sets the show data button on if the theme affects model parameters.
   */
  ngOnInit() {

    // set the show data button only if parameter values are changed
    if (typeof this.themeChoice.parameters !== 'undefined') {
      this.showDataButton = true;
    }

    // TO CHECK: will modify input values also when loading previous executions or canned scenarios
    // load data values to input parameters and sets if initially selected
    /*
    if (this.themeChoice.isSelected === true) {
      console.log(this.themeChoice.info[0].title + ' loaded data');
      this.modifyDataValues();
    }
    */

  }

  /**
   * Update the parameters and set values related to the selected theme
   */
  onThemeSelected() {
    try {

      // load parameter and set values to model inputs
      this.modifyDataValues();

      // reset all themes
      this.themeCatalogService.resetThemeSelected(this.themeChoice.info[this.langIndex].category);

      // select current theme
      this.themeChoice.isSelected = true;

      // update the description for this run
    } catch (error) {
      // TODO: user error handler component here
      console.log(error);
    }
  }

 /**
  * Updates data values for model inputs with scenario theme values
  */
  private modifyDataValues() {
    try {

      if (typeof this.themeChoice.parameters !== 'undefined') {
        for (const parameter of this.themeChoice.parameters) {
          this.parameterService.updateParamValue(parameter.paramName, parameter.paramValue);
          // this is a hack need to find better solution
          if (parameter.paramName === 'StartYear') {
            // set the start year on projection
            this.modelRunService.setProjectionStart(String(parameter.paramValue));
          }
        }
      }

      if (typeof this.themeChoice.sets !== 'undefined') {
        for (const set of this.themeChoice.sets) {
          this.setCatalogService.updateSetValue(set.setName, set.setValue);
          // console.log(set.setName + ' has been changed: ' + set.setValue);
        }
      }
    } catch (error) {
      console.log(error);
    }

  }

  /**
   * TODO:
   * Open up a dialog window that shows the data for this theme in bar plot and table views
   */
  onShowData() {

    // select this theme when clicking on learn more just to update projection start
    this.onThemeSelected();

    const dialogRef = this.dialog.open(ThemeDetailComponent, {
      width: '780px',
      data: this.themeChoice,
    });

  }

}
