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

  gameDataStatus: IGameDataModel[];
  gameDataArr: IGameDataModel;
  gamesArray: IGamesModel[] = [];
  gameDataStatusToPlot: IGameDataModel[];
  testToPlot: IGamesModel[];




  set GameDataStatus(status: IGameDataModel[]) {

    this.gameDataStatus = status;
    this.gameDataStatusToPlot = this.gameDataStatus.slice(0, 20);
  }

  set GamesArrayForChart(status: IGameDataModel) {


    // status.forEach(item => {
    //   const index = this.gamesArray.findIndex(game => game.game_id === item.game_data.id);
    //
    //   if (index < 0) {
    //     this.gamesArray.push({
    //       game_id: item.game_data.id,
    //       game_data: [...status]
    //     })
    //   } else {
    //     this.gamesArray[index].game_data.push(item)
    //   }
    // })
    this.gameDataArr = status;

    this.testToPlot = this.gamesArray.slice(0, 20);

  }

  constructor(private socketService: WebsocketService) {

    this.GameDataStatus;
    this.GamesArrayForChart;
    this.gameDataArr;
    let gamesDataUpdateObservable = this.socketService.getUpdates();
    gamesDataUpdateObservable.subscribe((latestStatus: IGameDataModel) => {  // 2

      //  this.GameDataStatus = [latestStatus].concat(this.gameDataStatus);  // 3
      this.GamesArrayForChart = latestStatus;
      //console.log(this.gameDataStatus);
    });

  }

  ngOnInit(): void {

    this.res = this.socketService.counter;

  }

}
