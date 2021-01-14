import {Component, OnInit} from '@angular/core';

import {WebsocketService} from "./websocket.service";
import {AuthenticationService} from "./services/authentication.service";
import {ActivatedRoute, Router} from "@angular/router";

const TWITCH_CLIENT_ID = 'bnovmkukib4m30y39t9w03tnu34jxe';
const TWITCH_SECRET = '2w698wvvbqfdrpd8l31oz8jo9xrtns';
const SESSION_SECRET = 'some_secret';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  code;
  code_url = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${TWITCH_CLIENT_ID}&redirect_uri=http://localhost:4200/`;
  res;

  constructor(private socketService: WebsocketService,
              private authService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router) {


  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        console.log(code);
        this.authService.login(code).subscribe(res => {
        //  console.log(res);
          this.router.navigate(['/home'],  { relativeTo: this.route })
        });
        // this.res = this.socketService.counter;
      }
    });
  }
}
