import {Component, OnDestroy, OnInit} from '@angular/core';
import {Duration} from "@shared/utils/Duration";
import {ZertipowerService} from "@shared/infrastructure/services/zertipower/zertipower.service";
import {UserStoreService} from "../../../../user/infrastructure/services/user-store.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {BehaviorSubject, map} from "rxjs";
import dayjs from "@shared/utils/dayjs";

@Component({
  selector: 'app-data-source-health',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe
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

  constructor(
    private readonly zertipower: ZertipowerService,
    private readonly userStore: UserStoreService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.updateStatus();
    this.timeoutIdentifier = window.setTimeout(async () => {
      await this.updateStatus();
    }, Duration.MINUTE * 5)
  }

  private async updateStatus() {
    const {cups, selectedCupsIndex} = this.userStore.snapshot();
    const selectedCups = cups[selectedCupsIndex];

    this.active = await this.zertipower.cups.datadisActive(selectedCups.id);
    this.lastUpdate$.next(new Date());
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.timeoutIdentifier);
  }
}
