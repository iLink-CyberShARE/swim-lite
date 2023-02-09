import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CanDialogComponent } from './can-dialog.component';

describe('CanDialogComponent', () => {
  let component: CanDialogComponent;
  let fixture: ComponentFixture<CanDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CanDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
