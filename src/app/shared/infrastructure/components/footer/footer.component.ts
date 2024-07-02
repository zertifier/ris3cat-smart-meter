import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import {LanguageComponent} from "@core/layouts/language/language.component";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterLink,
    LanguageComponent
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
