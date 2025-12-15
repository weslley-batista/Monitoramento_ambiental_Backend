import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class AppWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppWebSocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('subscribe:readings')
  handleSubscribeReadings(client: Socket) {
    client.join('readings');
    this.logger.log(`Cliente ${client.id} se inscreveu em readings`);
  }

  @SubscribeMessage('subscribe:alerts')
  handleSubscribeAlerts(client: Socket) {
    client.join('alerts');
    this.logger.log(`Cliente ${client.id} se inscreveu em alerts`);
  }

  emitReading(reading: any) {
    this.server.to('readings').emit('new-reading', reading);
  }

  emitAlert(alert: any) {
    this.server.to('alerts').emit('new-alert', alert);
  }

  emitStationUpdate(station: any) {
    this.server.emit('station-update', station);
  }
}

