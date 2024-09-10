import {Component} from '@angular/core';
import {
  QuestionBadgeComponent
} from "../../../../../../shared/infrastructure/components/question-badge/question-badge.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DatadisRegisterFormComponent} from "../../../components/datadis-register-form/datadis-register-form.component";
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-missing-cups-page',
  standalone: true,
  imports: [
    QuestionBadgeComponent,
    TranslocoDirective
  ],
  templateUrl: './missing-cup-page.component.html',
  styleUrl: './missing-cup-page.component.scss'
})
export class MissingCupPageComponent {
  constructor(private readonly ngbModal: NgbModal) {

  }
  public registerCups() {
    this.ngbModal.open(DatadisRegisterFormComponent);
  }
}
