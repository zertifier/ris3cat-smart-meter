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
import { IntegrationsService } from '../../services/integrations.service';

@Component({
    selector: 'integrations-page',
    standalone: true,
    imports: [
        AsyncPipe,
        FormsModule,
        QuestionBadgeComponent,
        DecimalPipe,
        NgIf,
        TranslocoDirective
    ],
    templateUrl: './integrations-page.component.html',
    styleUrl: './integrations-page.component.scss'
})
export class IntegrationsPageComponent {

    permanentToken: string = '';
    apiRealtimeDocsUrl:string = ''

    constructor(private userStore: UserStoreService,private integrationsService: IntegrationsService) {
        integrationsService.getPermaToken().subscribe((res:any)=>{
            this.permanentToken=res.token;
        })
        this.apiRealtimeDocsUrl=integrationsService.getRealtimeApiDocsUrl();
    }

    refreshPermanentToken(){
        this.integrationsService.refreshPermaToken().subscribe((res:any)=>{
            this.permanentToken=res.token;
        })
    }

}