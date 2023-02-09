import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.css']
})
export class RoleDialogComponent implements OnInit {

  /* language index */
  lan = 'en-us';

  /* selected user role */
  userRole  = '';

  /* Multilan options TODO: get from database instead */
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

  constructor(
    public dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.lan = this.locale.toLowerCase();
   }

  ngOnInit() {
  }

  /**
   * Closes the dialog and cancels the submission of the scenario.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

}
