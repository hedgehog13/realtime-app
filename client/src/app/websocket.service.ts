import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  constructor() { }

  // connect(): Subject<MessageEvent> {
  //   this.socket = io.io('wss://pubsub-edge.twitch.tv');
  //
  //   let observable = new Observable(observer => {
  //     this.socket.on('message', (data) => {
  //       console.log("Received message from Websocket Server");
  //       observer.next(data);
  //     })
  //     return () => {
  //       this.socket.disconnect();
  //     }
  //   });
  //   let observer = {
  //     next: (data: Object) => {
  //       this.socket.emit('message', JSON.stringify(data));
  //     },
  //   };
  //
  //   // we return our Rx.Subject which is a combination
  //   // of both an observer and observable.
  //   return Subject.create(observer, observable);
 // }
}
