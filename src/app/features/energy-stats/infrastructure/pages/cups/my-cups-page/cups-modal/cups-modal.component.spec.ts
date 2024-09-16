import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CupsModalComponent} from './cups-modal.component';

describe('CupsModalComponent', () => {
  let component: CupsModalComponent;
  let fixture: ComponentFixture<CupsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CupsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CupsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
