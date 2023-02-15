import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({ namespace: 'shot', cors: true })
export class ShotGatewayGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('screenShot')
  handelSend2Inf(client: any) {
    this.server.emit('takeScreenShot');
  }

  //listen to the event from the client
  @SubscribeMessage('theImage')
  recieveMessaege(client: any, payload: any) {
    console.log('client', client.id);
    console.log('data', payload);
    this.server.emit('receiveImage', payload);
  }
}
