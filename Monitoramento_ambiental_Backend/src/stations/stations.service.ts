import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  create(createStationDto: CreateStationDto) {
    return this.prisma.station.create({
      data: createStationDto,
      include: {
        sensors: true,
      },
    });
  }

  findAll() {
    return this.prisma.station.findMany({
      include: {
        sensors: {
          where: { isActive: true },
        },
        _count: {
          select: { readings: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.station.findUnique({
      where: { id },
      include: {
        sensors: true,
        _count: {
          select: { readings: true },
        },
      },
    });
  }

  update(id: string, updateStationDto: UpdateStationDto) {
    return this.prisma.station.update({
      where: { id },
      data: updateStationDto,
      include: {
        sensors: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.station.delete({
      where: { id },
    });
  }
}

