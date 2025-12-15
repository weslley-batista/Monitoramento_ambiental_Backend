import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateReadingDto {
  @IsString()
  stationId: string;

  @IsString()
  sensorId: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

