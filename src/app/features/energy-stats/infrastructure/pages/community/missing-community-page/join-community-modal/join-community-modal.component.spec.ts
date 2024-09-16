import {ComponentFixture, TestBed} from '@angular/core/testing';

import {JoinCommunityModalComponent} from './join-community-modal.component';

describe('JoinCommunityModalComponent', () => {
  let component: JoinCommunityModalComponent;
  let fixture: ComponentFixture<JoinCommunityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinCommunityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinCommunityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
