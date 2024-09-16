import {Component, EventEmitter, Output} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ZertiauthApiService} from "../../services/zertiauth-api.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-oauth-login',
  standalone: true,
  imports: [NgbModule, NgOptimizedImage],
  templateUrl: './oauth-login.component.html',
  styleUrl: './oauth-login.component.scss'
})
export class OauthLoginComponent {
  @Output() webWalletLoginRequest: EventEmitter<void> = new EventEmitter<void>()
  constructor(
    public zertiauth: ZertiauthApiService,
  ) {
  }

  loginWithGoogle() {
    window.location.href = this.zertiauth.getAuthUrl('google');
  }

  loginWithTwitter() {
    window.location.href = this.zertiauth.getAuthUrl('twitter');
  }

  connectWithWebWallet() {
    this.webWalletLoginRequest.emit()
  }
}
