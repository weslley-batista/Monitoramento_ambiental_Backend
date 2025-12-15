import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { SensorType } from '@prisma/client';

export class CreateSensorDto {
  @IsString()
  stationId: string;

  @IsString()
  name: string;

  @IsEnum(SensorType)
  type: SensorType;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  alertThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

