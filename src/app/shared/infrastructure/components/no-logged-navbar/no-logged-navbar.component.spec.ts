import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NoLoggedNavbarComponent} from './no-logged-navbar.component';

describe('NoLoggedNavbarComponent', () => {
  let component: NoLoggedNavbarComponent;
  let fixture: ComponentFixture<NoLoggedNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoLoggedNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoLoggedNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
