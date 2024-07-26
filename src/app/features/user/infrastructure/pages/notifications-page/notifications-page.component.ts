import { Component, OnDestroy } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgIf } from "@angular/common";
import { UserStoreService } from "../../services/user-store.service";
import { FormsModule } from "@angular/forms";
import { QuestionBadgeComponent } from "@shared/infrastructure/components/question-badge/question-badge.component";
import { Subscription } from "rxjs";
import Swal from "sweetalert2";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslocoDirective } from "@jsverse/transloco";
import { AuthStoreService } from '../../../../auth/infrastructure/services/auth-store.service';
import { EventBus } from '../../../../../shared/domain/EventBus';
import { NotificationsService } from '../../services/notifications.service';


@Component({
    selector: 'notifications-page',
    standalone: true,
    imports: [
        AsyncPipe,
        FormsModule,
        QuestionBadgeComponent,
        DecimalPipe,
        NgIf,
        TranslocoDirective
    ],
    templateUrl: './notifications-page.component.html',
    styleUrl: './notifications-page.component.scss'
})
export class NotificationsPageComponent {

    notifications={}

    constructor(private notificationsService:NotificationsService) {
        notificationsService.getNotifications().subscribe(notificationsResponse=>{
            console.log(notificationsResponse)
            //this.notifications = notificationsResponse.data;
        })
    }

    updateNotifications(){
        this.notificationsService.setNotifications(this.notifications)
    }

}