import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StarRateComponent } from './star-rate.component';

describe('StarRateComponent', () => {
  let component: StarRateComponent;
  let fixture: ComponentFixture<StarRateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StarRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StarRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
