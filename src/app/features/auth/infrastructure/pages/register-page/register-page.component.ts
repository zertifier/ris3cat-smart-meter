import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {JsonPipe, NgIf} from "@angular/common";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { AuthStoreService } from "../../services/auth-store.service";
import { ZertipowerService } from "../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import { Wallet } from "ethers";
import { UserLoggedInEvent } from "../../../domain/UserLoggedInEvent";
import { EventBus } from "../../../../../shared/domain/EventBus";
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';
import { FooterComponent } from '../../../../../shared/infrastructure/components/footer/footer.component';
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    TranslocoDirective,
    FooterComponent,
    NgbNavItem,
    NgbNavOutlet,
    NgbNav,
    NgbNavContent,
    NgbNavLinkButton,
    FormsModule,
    NgIf
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent implements OnInit {
  formData = this.formBuilder.group({
    dni: new FormControl<string>(''),
    name: new FormControl<string>('', [Validators.required]),
    lastname: new FormControl<string>('', [Validators.required]),
  });
  email: string = "";
  deviceType: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly authStore: AuthStoreService,
    private readonly zertipower: ZertipowerService,
    private readonly eventBus: EventBus,
    private readonly translocoService:TranslocoService
  ) {
  }

  ngOnInit(): void {
    let authStore = this.authStore.snapshotOnly(store => store.loginData)
    if (!authStore) {
      console.log('No auth data');
      this.router.navigate(['/auth/login']);
    } else {
      this.email = authStore?.email
    }
  }


  async register() {
    if (this.formData.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulari no valid'
      });
      return;
    }

    const { privateKey, email } = this.authStore.snapshotOnly(store => store.loginData!);
    const { dni, name, lastname } = this.formData.value;
    const wallet = new Wallet(privateKey);
    this.zertipower.auth.register({
      dni: dni || undefined,
      email: email!,
      name: name!,
      lastname: lastname!,
      wallet_address: wallet.address,
      private_key: privateKey,
    }).then(({accessToken,refreshToken})=>{
      Swal.fire({
        icon: 'success',
        title: this.translocoService.translate('AUTH.modals.register.correct'),
        timer: 2000,
        showConfirmButton:false,
        willClose: () => {
          this.changeAuthState(refreshToken,accessToken)
        }
      })
    });

  }

  async changeAuthState(refreshToken:string,accessToken:string) {
    this.authStore.setTokens({ refreshToken: refreshToken, accessToken: accessToken });
    // await this.eventBus.publishEvents(new UserLoggedInEvent());
    this.authStore.patchState({ loginTry: false });
  }

  goBack() {
    this.authStore.patchState({ loginTry: false });
    this.router.navigate(['/auth/login']);
  }
}
