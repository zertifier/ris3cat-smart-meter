import {Component} from '@angular/core';
import {FooterComponent} from "../../../shared/infrastructure/components/footer/footer.component";
import {NavbarComponent} from "../../../shared/infrastructure/components/navbar/navbar.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-navbar-layout',
  standalone: true,
  imports: [
    FooterComponent,
    NavbarComponent,
    RouterOutlet
  ],
  templateUrl: './navbar-layout.component.html',
  styleUrl: './navbar-layout.component.scss'
})
export class NavbarLayoutComponent {

}
