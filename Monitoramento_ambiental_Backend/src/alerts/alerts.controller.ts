import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertStatus } from '@prisma/client';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@Query('status') status?: AlertStatus) {
    return this.alertsService.findAll(status);
  }

  @Get('count')
  async getActiveCount() {
    const count = await this.alertsService.getActiveAlertsCount();
    return { count };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string, @Request() req) {
    return this.alertsService.resolve(id, req.user.id);
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id') id: string, @Request() req) {
    return this.alertsService.dismiss(id, req.user.id);
  }
}

