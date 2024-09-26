import {Component, OnDestroy, OnInit} from '@angular/core';
import {Duration} from "@shared/utils/Duration";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {UserProfile, UserStoreService} from "../../../../user/infrastructure/services/user-store.service";
import {AsyncPipe, NgClass, NgIf} from "@angular/common";
import {BehaviorSubject, map} from "rxjs";
import dayjs from "@shared/utils/dayjs";
import {TranslocoDirective} from "@jsverse/transloco";
import { MonitoringService } from '../../services/monitoring.service';

interface supply {
  address: string
  cups: string
  postalCode: string
  province: string
  municipality: string
  distributor: string
  validDateFrom: string
  validDateTo: string
  pointType: number
  distributorCode: number
  authorizedNif?: string
}

@Component({
  selector: 'app-data-source-health',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    TranslocoDirective,
    NgIf
  ],
  templateUrl: './data-source-health.component.html',
  styleUrl: './data-source-health.component.scss'
})
export class DataSourceHealthComponent implements OnInit, OnDestroy {
  lastUpdate$ = new BehaviorSubject<Date | undefined>(undefined);
  lastUpdate = this.lastUpdate$.pipe(map(d => {
    if (!d) {
      return 'No hi ha actualitzacions'
    } else {
      return dayjs(d).format('YYYY-MM-DD HH:mm');
    }
  }))
  timeoutIdentifier!: number
  active: boolean = false;

  datadisCups:any[]=[];
  loading: boolean;

  constructor(
    private readonly zertipower: ZertipowerService,
    private readonly userStore: UserStoreService,
    private readonly monitoringService: MonitoringService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    await this.updateStatus();
    this.timeoutIdentifier = window.setTimeout(async () => {
      this.loading = true;
      await this.updateStatus();
    }, Duration.MINUTE * 5)
  }

  private async updateStatus() {
    this.userStore.selectOnly(this.userStore.$.profileLoaded).subscribe(async (profileLoaded) => {
      if(profileLoaded){
        const {cups, selectedCupsIndex, user} = await this.userStore.snapshot();
        if(user && user.customer_id){
          let datadisActiveResponse:any = await this.zertipower.customers.datadisActive(user.customer_id);
          if(datadisActiveResponse.cupsInfo){
            this.datadisCups=datadisActiveResponse.cupsInfo;
          }
        }
        // this.monitoringService.getPowerFlow().subscribe(res=>{
        //   console.log(res)
        // })
        this.lastUpdate$.next(new Date());
        this.loading = false;
      }
    })
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.timeoutIdentifier);
  }
}
