import {Component, HostListener} from '@angular/core';
import {OauthLoginComponent} from "../../components/oauth-login/oauth-login.component";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {WebWalletLoginComponent} from "../../components/web-wallet-login/web-wallet-login.component";
import {LoginImagesService} from "../../services/login-images.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ZertiauthApiService} from "../../services/zertiauth-api.service";
import {
  BreakPoints,
  ScreenBreakPointsService
} from "../../../../../shared/infrastructure/services/screen-break-points.service";
import {TranslocoDirective} from "@jsverse/transloco";
import {LanguageComponent} from '../../../../../core/layouts/language/language.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    OauthLoginComponent,
    NgbNav,
    NgbNavItem,
    NgbNavLinkButton,
    WebWalletLoginComponent,
    NgbNavContent,
    NgbNavOutlet,
    NgOptimizedImage,
    NgClass,
    RouterLink,
    TranslocoDirective,
    LanguageComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  public imageUrl = this.loginImagesService.getRandomImage();
  public hideImage = false;
  public googleActive: boolean = false;

  constructor(
    private router: Router,
    public loginImagesService: LoginImagesService,
    private screenService: ScreenBreakPointsService,
    private zertiauthApiService: ZertiauthApiService,
  ) {
    this.onResize()
  }


  @HostListener('window:resize')
  onResize() {
    const breakpoint = this.screenService.getCurrentBreakPoint()
    this.hideImage = breakpoint <= BreakPoints.LG;
  }

  public googleLogin() {
    const authUrl = this.zertiauthApiService.getAuthUrl('google');
    window.location.replace(authUrl);
  }

  public webWalletLogin() {
    this.router.navigate(['energy-stats'])
  }
}
