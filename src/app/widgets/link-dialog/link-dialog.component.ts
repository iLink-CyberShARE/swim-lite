import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faUniversalAccess } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-link-dialog',
  templateUrl: './link-dialog.component.html',
  styleUrls: ['./link-dialog.component.css']
})
export class LinkDialogComponent implements OnInit {

  faUniversalAccess = faUniversalAccess;

  public copied = false;

  constructor(
    public dialogRef: MatDialogRef<LinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public link: string,
  ) {
  }

  ngOnInit() {}

  /**
   * Copy input text to clipboard
   * @param inputElement element to copy text from
   */
  onCopyLink(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.copied = true;
  }

  /**
   * Closes the dialog and cancels the submission of the scenario.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }
}
