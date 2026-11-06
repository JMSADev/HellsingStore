import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';

// Permite mostrar moeda e datas em português (R$ 1.234,56).
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // permite chamar a API
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
