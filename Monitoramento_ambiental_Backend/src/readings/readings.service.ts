import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { AlertsService } from '../alerts/alerts.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ReadingsService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
    private websocketGateway: AppWebSocketGateway,
  ) {}

  async create(createReadingDto: CreateReadingDto) {
    const reading = await this.prisma.reading.create({
      data: createReadingDto,
      include: {
        sensor: {
          include: {
            station: true,
          },
        },
        station: true,
      },
    });

    await this.alertsService.checkAndCreateAlert(reading);

    this.websocketGateway.emitReading(reading);

    return reading;
  }

  findAll() {
    return this.prisma.reading.findMany({
      include: {
        sensor: true,
        station: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1000,
    });
  }

  findByStation(stationId: string, limit = 100) {
    return this.prisma.reading.findMany({
      where: { stationId },
      include: {
        sensor: true,
        station: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  findBySensor(sensorId: string, limit = 100) {
    return this.prisma.reading.findMany({
      where: { sensorId },
      include: {
        sensor: true,
        station: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });
  }

  getLatestReadings() {
    return this.prisma.reading.findMany({
      include: {
        sensor: {
          include: {
            station: true,
          },
        },
        station: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    });
  }

  getStatistics(sensorId: string, startDate: Date, endDate: Date) {
    return this.prisma.reading.groupBy({
      by: ['sensorId'],
      where: {
        sensorId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _avg: {
        value: true,
      },
      _min: {
        value: true,
      },
      _max: {
        value: true,
      },
      _count: {
        value: true,
      },
    });
  }
}

