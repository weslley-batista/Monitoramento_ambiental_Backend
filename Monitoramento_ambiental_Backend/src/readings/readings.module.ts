import { Module, forwardRef } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { AlertsModule } from '../alerts/alerts.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
  imports: [forwardRef(() => AlertsModule), WebSocketModule],
})
export class ReadingsModule {}

