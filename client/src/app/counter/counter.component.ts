import {Component, OnInit} from '@angular/core';

import {WebsocketService} from "../websocket.service";

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css']
})
export class CounterComponent implements OnInit {

  res: any;


  constructor(private socketService: WebsocketService) {

  }

  ngOnInit(): void {
    this.res = this.socketService.counter;
  }


}
