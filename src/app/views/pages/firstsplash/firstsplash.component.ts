import { Component, OnInit } from '@angular/core';
import { faSwimmingPool } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-firstsplash',
  templateUrl: './firstsplash.component.html',
  styleUrls: ['./firstsplash.component.css']
})
export class FirstsplashComponent implements OnInit {

  faSwimmingPool = faSwimmingPool;

  constructor() { }

  ngOnInit(): void {
  }

}
