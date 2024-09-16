import {Injectable} from '@angular/core';
import {App} from '@zertifier/zertiauthjs';


@Injectable({
  providedIn: 'root'
})
/**
 * This service abstracts the interaction between the client and [Zertiauth](https://github.com/zertifier/zertiauth)
 */
export class ZertiauthApiService {
  app = new App("0ba3f4b3-55fa-499f-8782-23c81a2b4652");
  redirectUrl: string = `${window.location.origin}/auth/oauth-callback`;
  constructor(
  ) {
  }


  getAuthUrl(platform: 'google' | 'twitter' | 'github') {
    const {baseCode, codeChallenge} = this.app.generateCodeChallenge();
    localStorage.setItem('baseCodeChallenge', baseCode);

    return this.app.getAuthUrl(this.redirectUrl, platform, codeChallenge)
  }

  getPrivateKey(code: string): Promise<{privateKey: string, email: string}> {
    const baseCode = localStorage.getItem('baseCodeChallenge');
    if (!baseCode) {
      throw new Error('Base code not saved on local storage')
    }
    return this.app.getCredentials(code, baseCode);
  }
}
