import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {WebsocketService} from "./websocket.service";
import {IGameDataModel, IGamesModel} from "./real-time-chart/gameData.model";
import {Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  res;

  oneObjectThreeGames = null;

  NewElement(gamesObj) {

    this.oneObjectThreeGames = gamesObj
  }

  constructor(private socketService: WebsocketService, private http: HttpClient, private router:Router) {


    let updatedObsv = this.socketService.getGamesForChart();

    updatedObsv.subscribe(data => {
      this.NewElement(data);
    })
  }

  ngOnInit(): void {
  }


}
