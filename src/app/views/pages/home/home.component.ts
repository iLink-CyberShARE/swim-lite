import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterEvent, Scroll } from '@angular/router';
import { faBalanceScale, faCogs, faUsers, faArchive, faUser } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';

/**
 * SWIM Project Home page
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  faBalanceScale = faBalanceScale;
  faCogs = faCogs;
  faUsers = faUsers;
  faArchive = faArchive;
  faUser = faUser;

  schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SWIM 2',
    url: 'https://swim.cybershare.utep.edu',
    version: 2.4,
    author: {
      '@type' : 'Organization',
      name: 'University of Texas at El Paso'
    },
    keywords: 'SWIM, Sustainable Water, Middle Rio Grande, Rio Bravo, Modeling, El Paso Water, Irrigitation Districts, Las Cruces Water, Juarez Water, Water Models',
    description: 'SWIM: Sustainable Water through Integrated Modeling. SWIM enables stakeholder-driven analysis of water systems from the socio-environmental perspective by integrating mathematical models into an online environment.',
    license: 'https://creativecommons.org/licenses/by-nc/4.0/',
    sponsor: [{
      '@type' : 'Organization',
      name: 'National Science Foundation (NSF)'
    },
    {
      '@type' : 'Organization',
      name: 'United States Department of Agriculture (USDA)'
    }]
  };

  /**
   * Constructor
   */
  constructor(
    router: Router,
    viewportScroller: ViewportScroller
  ) {

    router.events.pipe(
      filter((e: RouterEvent | Scroll ): e is Scroll => e instanceof Scroll)
    ).subscribe(e => {
        viewportScroller.scrollToPosition([0, 0]);
    });
   }


}
