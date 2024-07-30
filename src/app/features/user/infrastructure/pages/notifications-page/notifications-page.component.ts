import { Component, OnDestroy } from '@angular/core';
import { AsyncPipe, DecimalPipe, NgIf } from "@angular/common";
import { UserStoreService } from "../../services/user-store.service";
import { FormsModule } from "@angular/forms";
import { QuestionBadgeComponent } from "@shared/infrastructure/components/question-badge/question-badge.component";
import { Subscription } from "rxjs";
import Swal from "sweetalert2";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
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

    notifications: any = {}

    constructor(private notificationsService: NotificationsService, private translate: TranslocoService) {
        notificationsService.getNotifications().subscribe((notificationsResponse: any) => {
            console.log(notificationsResponse)
            this.notifications = notificationsResponse.data;
        })
    }

    updateNotifications() {
        this.notificationsService.setNotifications(this.notifications).subscribe(res=>{console.log(res)})
    }

    getTranslation(name: string): string {
        return this.translate.translate(`NOTIFICATIONS.texts.${name}`);
    }

    getUserCategoryStatus(categoryId: number): boolean {
        const userCategory = this.notifications.userCategories.find((cat: any) => cat.notificationCategoryId === categoryId);
        return userCategory ? !!userCategory.active : false;
    }

    getUserNotificationStatus(notificationId: number): boolean {
        const userNotification = this.notifications.userNotifications.find((not: any) => not.notificationId === notificationId);
        return userNotification ? !!userNotification.active : false;
    }

    updateCategoryPreference(categoryId: number): void {
        const userCategory = this.notifications.userCategories.find((cat: any) => cat.notificationCategoryId === categoryId);
        if (userCategory) {
            userCategory.active = !userCategory.active;
            userCategory.active = userCategory.active ? 1 : 0
            this.updateNotifications();
        }
    }

    updateNotificationPreference(notificationId: number): void {
        const userNotification = this.notifications.userNotifications.find((not: any) => not.notificationId === notificationId);
        if (userNotification) {
            userNotification.active = !userNotification.active;
            userNotification.active = userNotification.active ? 1 : 0
            this.updateNotifications();
        }
    }

}