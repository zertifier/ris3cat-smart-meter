import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {LoginActionService} from "../../../actions/login-action.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [],
  templateUrl: './login-callback.component.html',
  styleUrl: './login-callback.component.scss'
})
export class LoginCallbackComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly loginAction: LoginActionService,
  ) {
  }

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const code: string = params['code'];

    if (!code) {
      throw new Error('Code not received from oauth');
    }

    try {
      await this.loginAction.run(code);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: "No s'ha pogut iniciar sessió"
      });
      this.router.navigate(['/auth/login'])
    }
    await this.router.navigate(['/energy-stats']);
  }
}
