import {Component, OnInit} from '@angular/core';
import {
  BreakPoints,
  ScreenBreakPointsService
} from "../../../../../shared/infrastructure/services/screen-break-points.service";
import {first, map, skipWhile} from "rxjs";
import {AsyncPipe, NgClass} from "@angular/common";
import {UserStoreService} from "../../services/user-store.service";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {ZertipowerService} from "../../../../../shared/infrastructure/services/zertipower/zertipower.service";
import Swal from "sweetalert2";
import {EventBus} from "../../../../../shared/domain/EventBus";
import {UserProfileChangedEvent} from "../../../../auth/domain/UserProfileChangedEvent";

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile-page.component.html',
  styleUrl: './user-profile-page.component.scss'
})
export class UserProfilePageComponent implements OnInit {
  expandButtons$ = this.screensBreakpointsService
    .observeBreakpoints()
    .pipe(map(breakPoint => breakPoint <= BreakPoints.MD));

  formGroup = this.formBuilder.group({
    firstname: new FormControl<string>('', [Validators.required]),
    lastname: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private readonly screensBreakpointsService: ScreenBreakPointsService,
    private readonly userStore: UserStoreService,
    private readonly formBuilder: FormBuilder,
    private readonly zertipower: ZertipowerService,
    private readonly eventBus: EventBus,
  ) {
  }

  ngOnInit(): void {
    const {firstname, lastname} = this.formGroup.controls;
    this.userStore
      .selectOnly(state => state.user?.firstname)
      .pipe(skipWhile(value => !value), first())
      .subscribe(value => firstname.setValue(value!));

    this.userStore
      .selectOnly(state => state.user?.lastname)
      .pipe(skipWhile(value => !value), first())
      .subscribe(value => lastname.setValue(value!));
  }

  async saveData() {
    if (this.formGroup.invalid) {
      throw new Error('User id not defined');
    }

    const user = this.userStore.snapshotOnly(state => state.user);
    if (!user) {
      throw new Error('User profile not defined');
    }
    const {id, email, wallet_address, username, role} = user;
    const {firstname, lastname} = this.formGroup.value;
    try {
      await this.zertipower.users.update(id, {
        email, wallet_address, username, role, firstname: firstname!, lastname: lastname!, password: '', customer_id: user.customer_id
      });
      await this.eventBus.publishEvents(new UserProfileChangedEvent());
      await Swal.fire({
        icon: 'success',
        title: "Perfil actualitzat correctament",
        confirmButtonText: "D'acord"
      });
    }catch (error){

      await Swal.fire({
        icon: 'error',
        title: "Error al actualitzar el perfil",
        text: "Torna-ho a intentar en uns minuts",
        confirmButtonText: "D'acord"
      });
      console.log(error)
    }

  }
}
