import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { authTokenInterceptor } from "./features/auth/infrastructure/interceptors/auth-token.interceptor";
import { errorCatchingInterceptor } from "./shared/infrastructure/interceptors/errorCatching.interceptor"
import { EventBus } from "./shared/domain/EventBus";
import { InMemoryEventBusService } from "./shared/infrastructure/services/in-memory-event-bus.service";
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authTokenInterceptor, errorCatchingInterceptor])
    ),
    provideAnimations(),
    { provide: EventBus, useClass: InMemoryEventBusService },
    provideTransloco({
      config: {
        availableLangs: ['en', 'es', 'ca'],
        defaultLang: 'ca',
        fallbackLang: ['en', 'es', 'ca'],
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
