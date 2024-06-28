import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {provideAnimations} from "@angular/platform-browser/animations";
import {authTokenInterceptor} from "./features/auth/infrastructure/interceptors/auth-token.interceptor";
import {EventBus} from "./shared/domain/EventBus";
import {InMemoryEventBusService} from "./shared/infrastructure/services/in-memory-event-bus.service";
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authTokenInterceptor])
    ),
    provideAnimations(),
    {provide: EventBus, useClass: InMemoryEventBusService}, provideHttpClient(), provideTransloco({
        config: {
          availableLangs: ['en', 'es', 'cat'],
          defaultLang: 'cat',
          fallbackLang: ['en', 'es', 'cat'],
          missingHandler: {
            // It will use the first language set in the `fallbackLang` property
            useFallbackTranslation: true
          },
          // Remove this option if your application doesn't support changing language in runtime.
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      }),
  ]
};
