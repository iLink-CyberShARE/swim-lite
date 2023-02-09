import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TimeRangeDialogComponent } from './time-range-dialog.component';

describe('TimeRangeDialogComponent', () => {
  let component: TimeRangeDialogComponent;
  let fixture: ComponentFixture<TimeRangeDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeRangeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeRangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
