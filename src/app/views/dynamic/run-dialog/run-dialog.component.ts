import { Component, Inject, OnInit , LOCALE_ID} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserScenario } from 'src/app/models/user-scenario';

// services
import { ModelRunService } from '../../../services/model-run.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

/**
 * Popup dialog that shows before submitting a model scenario for execution.
 * Asks for scenario name and description.
 */
@Component({
  selector: 'app-run-dialog',
  templateUrl: './run-dialog.component.html',
  styleUrls: ['./run-dialog.component.css']
})

export class RunDialogComponent implements OnInit  {

  /* Agreement variable */
  agreement = false;

  /* language index */
  lan = 'en-us';

  /* selected user role */
  userRole  = '';

  /* Multi-lan options */
  roleOptions = [
    {'en-us': 'City Resident', 'es-mx': 'Residente Urbano'},
    {'en-us': 'Educator', 'es-mx': 'Educador'},
    {'en-us': 'Environmentalist', 'es-mx': 'Ambientalista'},
    {'en-us': 'Farmer', 'es-mx': 'Agricultor'},
    {'en-us': 'Regulator', 'es-mx': 'Regulador'},
    {'en-us': 'Researcher', 'es-mx': 'Investigador'},
    {'en-us': 'Rural Resident', 'es-mx': 'Residente Rural'},
    {'en-us': 'Student', 'es-mx': 'Estudiante'},
    {'en-us': 'Water Manager', 'es-mx': 'Administrador de Agua'},
  ];

  /** Flag to check if user is logged in */
  isAuthenticated = false;

  /** Subscription to the user authentication */
  private userSub =  new Subscription();

  /**
   * Class constructor method
   * @param dialogRef Functions as a dialog popup
   * @param modelRunService Uses the model run service
   * @param data UserScenario data to submit
   */
  constructor(
    public dialogRef: MatDialogRef<RunDialogComponent>,
    public modelRunService: ModelRunService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: UserScenario,
    @Inject(LOCALE_ID) private locale: string
    ) {
      this.lan = this.locale.toLowerCase();
    }

    /**
     * Inicialization method.
     * Sets a system generated hint description from theme selection.
     */
    ngOnInit() {
      this.userSub = this.authService.user.subscribe( user => {
        if (!!user) {
          this.isAuthenticated = !user.guestStatus;
        }
      });

      if (this.isAuthenticated) {
        this.agreement = true;
      }

    }

    /**
     * Automatically adds description according to the selected scenario combination
     */
    onDescriptionClick() {
        this.data.description = this.modelRunService.getScenarioDescription();
    }

    /**
     * Closes the dialog and cancels the submission of the scenario.
     */
    onNoClick(): void {
      this.dialogRef.close();
    }

    onSubmit() {
      this.modelRunService.setUserRole(this.userRole);
    }

}
