// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// import { provideFirebaseApp } from '@angular/fire/app';
// import { initializeApp } from 'firebase/app';

const $BASE_DEV = 'http://localhost:3000'

export const environment = {
  production: false,
  baseDev: $BASE_DEV,
  auth: {
    login: `${$BASE_DEV}/`,
    register: `${$BASE_DEV}/register`
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
