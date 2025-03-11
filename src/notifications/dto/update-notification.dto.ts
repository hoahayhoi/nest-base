import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserNotificationDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  notificationId: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 3 })
  @IsNotEmpty()
  @IsNumber()
  deviceId: number; // ID thiết bị để xác định chính xác
}
