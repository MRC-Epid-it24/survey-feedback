import {Injectable} from "@angular/core";
import {CookieService} from "angular2-cookie/core";
import {User} from "../classes/user.class";
import {RequestOptions, Http, Response, Headers} from "@angular/http";
import {ApiEndpoints} from "../api-endpoints";
import {Observable, ReplaySubject, BehaviorSubject} from "rxjs";

@Injectable()
export class UserStateService {

  private static readonly Name = "UserStateService";

  private readonly ACCESS_TOKEN_COOKIE_NAME: string = "accessToken";
  private readonly REFRESH_TOKEN_COOKIE_NAME: string = "refreshToken";

  private accessTokenSubject: ReplaySubject<string> = new ReplaySubject();

  private authenticated: boolean;
  authenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private cookieService: CookieService,
              private http: Http) {
  }

  setRefreshToken(token: string): void {
    this.notifyAuthSubscribers();
    this.cookieService.put(this.REFRESH_TOKEN_COOKIE_NAME, token);
  }

  getAccessToken(): Observable<string> {
    this.notifyAuthSubscribers();
    let accToken = this.cookieService.get(this.ACCESS_TOKEN_COOKIE_NAME);
    if (accToken != null) {
      return Observable.of(accToken);
    } else {
      if (this.accessTokenSubject.observers.length == 0) {
        this.refreshAccessToken().subscribe();
      }
      return this.accessTokenSubject.asObservable();
    }
  }

  getSurveyId(): Observable<string> {
    return this.getCredentialsFromToken().map(uc => uc.surveyId);
  }

  refreshAccessToken(): Observable<Response> {
    this.dropAccessToken();
    return this.getRefreshToken().flatMap(token => {
      let reqOptions = new RequestOptions();
      reqOptions.headers = new Headers({
        "X-Auth-Token": token
      });
      return this.http.post(ApiEndpoints.refreshUserToken(), {}, reqOptions)
        .map(res => {
          this.setAccessToken(res.json().accessToken);
          return res;
        }).catch(err => {
          this.notifyAuthSubscribers();
          return Observable.throw(err);
        });
    });
  }

  private dropAccessToken(): void {
    this.cookieService.remove(this.ACCESS_TOKEN_COOKIE_NAME);
  }

  private setAccessToken(token: string): void {
    this.notifyAuthSubscribers();
    this.accessTokenSubject.next(token);
    this.accessTokenSubject.complete();
    this.cookieService.put(this.ACCESS_TOKEN_COOKIE_NAME, token);
  }

  private getRefreshToken(): Observable<string> {
    let token = this.cookieService.get(this.REFRESH_TOKEN_COOKIE_NAME);
    if (token == null) {
      return Observable.throw(`${UserStateService.Name}: Refresh token is not set`);
    } else {
      this.notifyAuthSubscribers();
      return Observable.of(token);
    }
  }

  private getCredentialsFromToken(): Observable<User> {
    return this.getAccessToken().map(accToken => this.accTokenToUser(accToken));
  }

  private notifyAuthSubscribers(): void {
    let refreshToken = this.cookieService.get(this.REFRESH_TOKEN_COOKIE_NAME);
    let accessToken = this.cookieService.get(this.ACCESS_TOKEN_COOKIE_NAME);
    let auth = refreshToken != null && accessToken != null;
    if (auth != this.authenticated) {
      this.authenticatedSubject.next(auth);
    }
  }

  private accTokenToUser(accToken: string): User {
    let tokenPart = accToken.split(".")[1],
      parsedToken = JSON.parse(atob(tokenPart)),
      credentials = JSON.parse(atob(parsedToken.sub)),
      providerParts = credentials.providerKey.split("#");
    if (providerParts.length < 2) {
      throw "Access token format changed. Could not retrieve surveyId and userName";
    }
    return new User(providerParts[1], providerParts[0], parsedToken.roles);
  }

}
