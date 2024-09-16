import {Injectable} from '@angular/core';
import {RxStore} from "@zertifier/rx-store";
import {jwtDecode, JwtPayload} from 'jwt-decode';

export interface AuthState {
  accessToken: string;
  refreshToken: string;
  authData?: {
    id: number;
    firstname: string;
    email: string;
    username: string;
    wallet_address: string;
    role: string;
  };
  loginTry: boolean;
  loginData?: { email: string, privateKey: string };
}

const defaultValues: AuthState = {
  accessToken: '',
  refreshToken: '',
  loginTry: false,
}

export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';
export const OAUTH_CODE = 'oauthCode';
export type DecodedToken = JwtPayload & {
  id: number;
  firstname: string;
  email: string;
  username: string;
  wallet_address: string;
  role: string;
}
@Injectable({
  providedIn: 'root'
})
/**
 * AuthStoreService is the responsible to save auth data on runtime. This allows to use something called interceptors.
 * That's the case of {@link AuthPersistenceProxyService}. It intercepts every change on auth storage and saves the tokens
 * to LocalStorage.
 */
export class AuthStoreService extends RxStore<AuthState> {
  /**
   * $ is the auth store selectors. This encapsulates functions that
   * act as selectors to avoid repeating the same functions everywhere
   */
  readonly $ = {
    /**
     * Check if use is logged in based on store values
     * @param state
     */
    loggedIn: (state: AuthState) => !!state.refreshToken
  }

  constructor() {
    super(defaultValues);
  }

  public removeTokens() {
    this.patchState({accessToken: '', refreshToken: '', authData: undefined})
  }

  public removeOauthCode() {
    localStorage.removeItem(OAUTH_CODE);
  }

  public setTokens({refreshToken, accessToken}: { refreshToken: string, accessToken: string }) {
    const decodedToken = this.decodeToken(refreshToken);
    this.patchState({refreshToken, accessToken, authData: decodedToken});
  }

  public saveOauthCode(oauthCode: string) {
    localStorage.setItem(OAUTH_CODE, oauthCode);
  }

  private decodeToken(refreshToken: string): DecodedToken {
    return jwtDecode(refreshToken) as DecodedToken;
  }

  public getOauthCode() {
    return localStorage.getItem(OAUTH_CODE) || ''
  }

  public override resetDefaults() {
    super.resetDefaults();
    this.removeTokens();
    this.removeOauthCode()
  }
}
