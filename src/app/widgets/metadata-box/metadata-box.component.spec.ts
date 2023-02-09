import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetadataBoxComponent } from './metadata-box.component';

describe('MetadataBoxComponent', () => {
  let component: MetadataBoxComponent;
  let fixture: ComponentFixture<MetadataBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
