import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css']
})
export class PolicyComponent implements AfterViewInit {

  constructor() { }

  /** After the view is loaded scroll to the top of the section */
  ngAfterViewInit() {
    window.scrollTo(0, 0);
    let top = document.getElementById('top');
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

}
