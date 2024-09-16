import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import {LanguageComponent} from "@core/layouts/language/language.component";
import {TranslocoDirective} from "@jsverse/transloco";

@Component({
  selector: 'app-footer',
  standalone: true,
    imports: [
        RouterLink,
        LanguageComponent,
        TranslocoDirective
    ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

}
