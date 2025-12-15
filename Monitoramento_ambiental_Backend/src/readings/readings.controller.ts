import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Post()
  create(@Body() createReadingDto: CreateReadingDto) {
    return this.readingsService.create(createReadingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.readingsService.findAll();
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  getLatest() {
    return this.readingsService.getLatestReadings();
  }

  @Get('station/:stationId')
  @UseGuards(JwtAuthGuard)
  findByStation(
    @Param('stationId') stationId: string,
    @Query('limit') limit?: string,
  ) {
    return this.readingsService.findByStation(
      stationId,
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('sensor/:sensorId')
  @UseGuards(JwtAuthGuard)
  findBySensor(
    @Param('sensorId') sensorId: string,
    @Query('limit') limit?: string,
  ) {
    return this.readingsService.findBySensor(
      sensorId,
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('statistics/:sensorId')
  @UseGuards(JwtAuthGuard)
  getStatistics(
    @Param('sensorId') sensorId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.readingsService.getStatistics(
      sensorId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

