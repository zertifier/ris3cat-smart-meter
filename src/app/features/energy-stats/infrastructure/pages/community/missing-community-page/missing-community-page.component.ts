import {Component} from '@angular/core';
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {NavbarComponent} from "../../../../../../shared/infrastructure/components/navbar/navbar.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {JoinCommunityModalComponent} from "./join-community-modal/join-community-modal.component";
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-missing-community-page',
  standalone: true,
  imports: [
    QuestionBadgeComponent,
    NavbarComponent,
    TranslocoDirective
  ],
  templateUrl: './missing-community-page.component.html',
  styleUrl: './missing-community-page.component.scss'
})
export class MissingCommunityPageComponent {
  constructor(
    private readonly modalService: NgbModal
  ) {
  }


  openJoinModal(){
    const modalRef = this.modalService.open(JoinCommunityModalComponent)
  }

}
