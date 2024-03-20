import {Component, NgZone, OnInit} from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './app-logo.component.html',
  styleUrl: './app-logo.component.scss'
})
export class AppLogoComponent implements OnInit {
  public logoUrl = '';

  constructor(private ngZone: NgZone) {
  }

  ngOnInit() {
    this.logoUrl = this.isDarkMode() ? '/assets/img/logo/smart_meter_dark_mode.png' : '/assets/img/logo/smart_meter_light_mode.png';

    this.listenDarkModeChanges((darkMode) => {
      this.logoUrl = darkMode ? '/assets/img/logo/smart_meter_dark_mode.png' : '/assets/img/logo/smart_meter_light_mode.png';
    })
  }

  listenDarkModeChanges(callback: (darkMode: boolean) => void) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.ngZone.run(() => {
        const isDarkMode = event.matches;
        callback(isDarkMode);
      });
    });
  }

  isDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}
