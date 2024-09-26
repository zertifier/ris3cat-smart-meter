import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {LanguageComponent} from "@core/layouts/language/language.component";
import {TranslocoDirective} from "@jsverse/transloco";
import packageJson from '../../../../../../package.json';
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
version: string;

constructor() {
  this.version = packageJson.version
}
}
