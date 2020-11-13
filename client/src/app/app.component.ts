import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../environments/environment";
import {map} from "rxjs/operators";
import {WebsocketService} from "./websocket.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  imgSrc;

  constructor(private http: HttpClient, ) {

    console.log(document.location.hash)
  }

  ngOnInit(): void {
    const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};
    this.http.get(`${environment.apiUrl}home`, httpOptions)
      .subscribe(res => {
        console.log(res);
        if(res['res']!=='error'){
          localStorage.setItem('accesstoken', res['accessToken']);

          this.imgSrc = res['data'][0].profile_image_url;
        }

       // this.ssocket.connect();

      })
    // }
  }
}
