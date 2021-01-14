import { Component, OnInit } from '@angular/core';
import {WebsocketService} from "../websocket.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  res;
   code
  constructor(private socketService: WebsocketService,private route: ActivatedRoute) {

  }

  ngOnInit(): void {
     this.socketService.setupSocketConnection();
    this.res = this.socketService.counter;

  }

}
