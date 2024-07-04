import { Component } from '@angular/core';
import {TranslocoDirective, TranslocoPipe, TranslocoService} from "@jsverse/transloco";
import {FormsModule} from "@angular/forms";
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownMenu,
  NgbDropdownModule,
  NgbDropdownToggle
} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [
    FormsModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownModule,
    TranslocoDirective,
    TranslocoPipe,
    NgClass
  ],
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss'
})
export class LanguageComponent {
  constructor(private translocoService: TranslocoService) {
  }

  // selectedLang:  'ca' | 'es' | 'en' | string = this.translocoService.getActiveLang()

  setLang(lang: 'ca' | 'es' | 'en' | string){
    this.translocoService.setActiveLang(lang);
  }

  getCurrentLang(){
    return this.translocoService.getActiveLang()
  }
}
