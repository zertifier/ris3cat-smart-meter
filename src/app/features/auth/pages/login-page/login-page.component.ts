import {Component, HostListener, OnInit} from '@angular/core';
import {OauthLoginComponent} from "../../components/oauth-login/oauth-login.component";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {WebWalletLoginComponent} from "../../components/web-wallet-login/web-wallet-login.component";
import {LoginImagesService} from "../../services/login-images.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Router} from "@angular/router";
import {BreakPoints, ScreenService} from "../../../../shared/services/screen.service";

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
    NgClass
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
    private screenService: ScreenService
  ) {
    this.onResize()
  }


  @HostListener('window:resize')
  onResize() {
    const breakpoint = this.screenService.getCurrentBreakPoint()
    this.hideImage = breakpoint <= BreakPoints.SM;
  }

  public googleLogin() {
    this.router.navigate(['energy-stats'])
  }

  public webWalletLogin() {
    this.router.navigate(['energy-stats'])
  }
}
