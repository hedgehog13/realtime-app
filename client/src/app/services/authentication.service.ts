import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {Router} from "@angular/router";

const TWITCH_CLIENT_ID = 'bnovmkukib4m30y39t9w03tnu34jxe';
const TWITCH_SECRET = '2w698wvvbqfdrpd8l31oz8jo9xrtns';
const SESSION_SECRET = 'some_secret';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSubject: BehaviorSubject<{}>;
  public user: Observable<{}>;
  httpOptions = {
    headers: new HttpHeaders()
       .set('content-type', 'application/json')
       .set('Access-Control-Allow-Origin', '*')
      .set('client-id', TWITCH_CLIENT_ID)
      //.set('Accept', 'application/vnd.twitchtv.v5+json')

  };

  constructor(private http: HttpClient, private router: Router,) {
  }

  public get userValue(): any {
    return this.userSubject.value;
  }

  login(code) {
    return this.http.post(`${environment.apiUrl}/token?code=${code}`, this.httpOptions);

  }

  refreshToken() {
    return this.http.post<any>(`${environment.apiUrl}/users/refresh-token`, {}, {withCredentials: true})
      .pipe(map((user) => {
        this.userSubject.next(user);
        this.startRefreshTokenTimer();
        return user;
      }));
  }

  // helper methods

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(this.userValue.jwtToken.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
