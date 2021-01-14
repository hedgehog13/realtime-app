import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from "../environments/environment";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket;
  counter = new Subject();

  constructor() {

  }

  setupSocketConnection() {
    this.socket = io.io(environment.apiUrl);
    this.socket.on('getCounter', (data) => {
    //  console.log(data);
      this.counter.next(data);

    });

  }

}
