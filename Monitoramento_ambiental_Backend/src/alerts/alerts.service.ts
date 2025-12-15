import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertStatus, Reading, Sensor, Station } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async checkAndCreateAlert(reading: Reading & { sensor: Sensor & { station?: Station } }) {
    const { sensor, value } = reading;

    if (!sensor.alertThreshold) {
      return null;
    }

    let shouldAlert = false;
    let message = '';

    if (sensor.maxValue && value > sensor.maxValue) {
      shouldAlert = true;
      message = `${sensor.name} ultrapassou o valor máximo permitido: ${value} ${sensor.unit} (máximo: ${sensor.maxValue} ${sensor.unit})`;
    } else if (sensor.minValue && value < sensor.minValue) {
      shouldAlert = true;
      message = `${sensor.name} está abaixo do valor mínimo permitido: ${value} ${sensor.unit} (mínimo: ${sensor.minValue} ${sensor.unit})`;
    } else if (sensor.alertThreshold && value > sensor.alertThreshold) {
      shouldAlert = true;
      message = `${sensor.name} ultrapassou o threshold de alerta: ${value} ${sensor.unit} (threshold: ${sensor.alertThreshold} ${sensor.unit})`;
    }

    if (shouldAlert) {
      const existingAlert = await this.prisma.alert.findFirst({
        where: {
          sensorId: sensor.id,
          status: AlertStatus.ACTIVE,
        },
      });

      if (!existingAlert) {
        return this.prisma.alert.create({
          data: {
            sensorId: sensor.id,
            message,
            value,
            threshold: sensor.alertThreshold || sensor.maxValue || sensor.minValue || 0,
            status: AlertStatus.ACTIVE,
          },
        });
      }
    }

    return null;
  }

  findAll(status?: AlertStatus) {
    const where = status ? { status } : {};
    return this.prisma.alert.findMany({
      where,
      include: {
        sensor: {
          include: {
            station: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.alert.findUnique({
      where: { id },
      include: {
        sensor: {
          include: {
            station: true,
          },
        },
        user: true,
      },
    });
  }

  async resolve(id: string, userId?: string) {
    return this.prisma.alert.update({
      where: { id },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        userId,
      },
    });
  }

  async dismiss(id: string, userId?: string) {
    return this.prisma.alert.update({
      where: { id },
      data: {
        status: AlertStatus.DISMISSED,
        userId,
      },
    });
  }

  getActiveAlertsCount() {
    return this.prisma.alert.count({
      where: {
        status: AlertStatus.ACTIVE,
      },
    });
  }
}

