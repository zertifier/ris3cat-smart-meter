import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {EnergyPrice, SharingUsersService} from "../../services/sharing-users.service";

@Component({
  selector: 'app-add-user-form-modal',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './add-user-form-modal.component.html',
  styleUrl: './add-user-form-modal.component.scss'
})
export class AddUserFormModalComponent {

  public selectedUserId = this.sharingUsersService.users[0].id;
  protected readonly EnergyPrice = EnergyPrice;

  constructor(protected sharingUsersService: SharingUsersService, private activeModal: NgbActiveModal) {
  }

  setSelectedUser(event: any) {
  }
  addUser(id: string) {
    const user = this.sharingUsersService.users.find(u => u.id === id);
    if (!user) {
      return;
    }
    this.sharingUsersService.users = this.sharingUsersService.users.filter(u => u.id !== id);
    this.sharingUsersService.addSharingUser(user);
    this.activeModal.dismiss();
  }
}
