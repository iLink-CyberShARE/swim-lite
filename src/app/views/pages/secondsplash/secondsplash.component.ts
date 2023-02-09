import { Component, OnInit } from '@angular/core';
import { faSwimmer } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-secondsplash',
  templateUrl: './secondsplash.component.html',
  styleUrls: ['../firstsplash/firstsplash.component.css']
})
export class SecondsplashComponent implements OnInit {

  faSwimmer = faSwimmer;

  constructor() { }

  ngOnInit(): void {
  }

}
