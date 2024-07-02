import { Component } from '@angular/core';
import {TranslocoService} from "@jsverse/transloco";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss'
})
export class LanguageComponent {
  constructor(private translocoService: TranslocoService) {
  }

  selectedLang:  'ca' | 'es' | 'en' | string = this.translocoService.getActiveLang()

  setLang(lang: 'ca' | 'es' | 'en' | string){
    this.translocoService.setActiveLang(lang);
  }
}
