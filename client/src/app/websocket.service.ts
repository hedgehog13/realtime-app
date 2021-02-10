import {Injectable} from '@angular/core';
import {environment} from "../environments/environment";
//import { io } from 'socket.io-client';
import * as io from 'socket.io-client';
import {from, Subject} from "rxjs";
import {IGameDataModel} from "./real-time-chart/gameData.model";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;
  counter = new Subject();


  constructor() {
    this.setupSocketConnection();
  }


  setupSocketConnection() {
    this.socket = io.io(environment.apiUrl);
    this.socket.on('getCounter', (data) => {
      this.counter.next(data);

    });
  }
  getUpdates() {
    let gameDataSub = new Subject<IGameDataModel>();
    let gameDataSubObservable = from(gameDataSub);
    this.socket.on('getCounterForChart', (gameData: IGameDataModel) => {
      gameDataSub.next(gameData);
    });

    return gameDataSubObservable;
  }

  getGamesForChart() {
    const gamesArraySubscription = new Subject<any[]>()
    let gameDataSubObservable = from(gamesArraySubscription);
    this.socket.on('getChartData_new', (res:any[]) => {
      gamesArraySubscription.next(res);
    })
    return gameDataSubObservable;
  }
}
