import { Component } from '@angular/core';
import {TranslocoService} from "@jsverse/transloco";

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [],
  templateUrl: './language.component.html',
  styleUrl: './language.component.scss'
})
export class LanguageComponent {
  constructor(private translocoService: TranslocoService) {
  }

  setLang(lang: 'ca' | 'es' | 'en'){
    this.translocoService.setActiveLang(lang);
  }
}
