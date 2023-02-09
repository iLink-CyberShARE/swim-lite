import { Injectable, Inject, LOCALE_ID, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})

/**
 * The Acronym Translation Service replaces hard to understans acronyms or names used directly on a model's
 * source code. This service therefore provides significant labels when presenting information for end users.
 */
 @Injectable({
  providedIn: 'root'
})

export class HelpComponent implements OnInit {

  private lang = ""

  constructor(
    @Inject(LOCALE_ID) public locale: string,
  ) { }

  ngOnInit() {
    this.lang = this.locale.toLowerCase();
    console.log(this.lang)
  }

  isEnglish () {
    return (this.lang == 'en-us')
  }

}
