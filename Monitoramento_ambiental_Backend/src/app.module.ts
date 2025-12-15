import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StationsModule } from './stations/stations.module';
import { SensorsModule } from './sensors/sensors.module';
import { ReadingsModule } from './readings/readings.module';
import { AlertsModule } from './alerts/alerts.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StationsModule,
    SensorsModule,
    ReadingsModule,
    AlertsModule,
    WebSocketModule,
  ],
})
export class AppModule {}

