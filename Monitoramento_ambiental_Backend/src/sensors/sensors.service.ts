import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@Injectable()
export class SensorsService {
  constructor(private prisma: PrismaService) {}

  create(createSensorDto: CreateSensorDto) {
    return this.prisma.sensor.create({
      data: createSensorDto,
      include: {
        station: true,
      },
    });
  }

  findAll() {
    return this.prisma.sensor.findMany({
      include: {
        station: true,
      },
    });
  }

  findByStation(stationId: string) {
    return this.prisma.sensor.findMany({
      where: { stationId, isActive: true },
      include: {
        station: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.sensor.findUnique({
      where: { id },
      include: {
        station: true,
      },
    });
  }

  update(id: string, updateSensorDto: UpdateSensorDto) {
    return this.prisma.sensor.update({
      where: { id },
      data: updateSensorDto,
      include: {
        station: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.sensor.delete({
      where: { id },
    });
  }
}

