import {Component, OnInit} from '@angular/core';
import {HttpHeaders} from "@angular/common/http";
import {WebsocketService} from "./websocket.service";
import {IGameDataModel, IGamesModel} from "./real-time-chart/gameData.model";


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

  constructor(private socketService: WebsocketService) {



    let updatedObsv = this.socketService.getGamesForChart();

    updatedObsv.subscribe(data => {
      this.NewElement(data);
    })
  }

  ngOnInit(): void {

    this.res = this.socketService.counter;

  }

}
