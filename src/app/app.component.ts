import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ProfileUpdaterService} from "./features/user/infrastructure/services/profile-updater.service";
import {AuthPersistenceProxyService} from "./features/auth/infrastructure/services/auth-persistence-proxy.service";
import {UserCupsUpdaterService} from "./features/user/infrastructure/services/user-cups-updater.service";
import {TranslocoHttpLoader} from "./transloco-loader";
import {TranslocoService} from "@jsverse/transloco";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ConfirmDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'smart-meter-frontend';

  constructor(
    private profileUpdater: ProfileUpdaterService,
    private cupsUpdater: UserCupsUpdaterService,
    private authProxy: AuthPersistenceProxyService,
) {
  }

  ngOnInit(): void {
    this.authProxy.init();

  }
}
