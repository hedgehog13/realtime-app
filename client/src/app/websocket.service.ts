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
  dataArrayChanged = new Subject();
  private item_game;
  private dataArray = [];
  firstGame;
  secondGame;

  constructor() {
    this.setupSocketConnection();
  }


  setupSocketConnection() {
    this.socket = io.io(environment.apiUrl);

      this.socket.on('getCounter', (data) => {
          console.log('data COUNTER:', data);
      this.counter.next(data);

    });
    //
    // this.socket.on('getCounterForChart', (data) => {
    //   //   //
    //   const found = this.dataArray.find(item => {
    //     return item.id === data.game_data.name
    //   });
    //   if (this.dataArray.length === 0 || !found) {
    //     const arrValue = {
    //       id: data.game_data.name,
    //       values: [{'date': new Date(), counter: data.counter}]
    //     };
    //
    //     this.dataArray.push(arrValue)
    //   } else {
    //     this.item_game = this.dataArray.find(item => item.id === data.game_data.name);
    //  //   this.item_game.values.push({'date': new Date(), counter: data.counter})
    //
    //   }
    //  // debugger;
    //   this.dataArrayChanged.next(data);
    //   //
    // })

  }

  getUpdates() {
    let gameDataSub = new Subject<IGameDataModel>();
    let gameDataSubObservable = from(gameDataSub);
    this.socket.on('getCounterForChart', (gameData: IGameDataModel) => {
      gameDataSub.next(gameData);
    });

    return gameDataSubObservable;
  }
}
