import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-metadata-box',
  templateUrl: './metadata-box.component.html',
  styleUrls: ['./metadata-box.component.css']
})
export class MetadataBoxComponent implements OnInit {

  /** Information that this box will carry */
  @Input() identifier: string;
  @Input() name: string;
  @Input() description: string;
  @Input() status: string;
  @Input() start: string;
  @Input() end: string;
  @Input() pstart: string;

  isStartDefined = false;

  constructor() { }

  ngOnInit() {
    // check if the start projection date is defined to show on box
    this.isStartDefined = typeof this.pstart !== 'undefined';
  }

}
