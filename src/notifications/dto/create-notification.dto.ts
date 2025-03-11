import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsInt()
  @IsOptional()
  sent_by?: number; // ID của Admin hoặc System nếu không truyền thì logic sẽ tự động gán là System

  @IsOptional()
  @IsString()
  @IsEnum(['pending', 'sent', 'failed'])
  status?: string;
}

export class SendNotificationToUsersDto {
  notificationId: number;
  userIds: number[];
}

export class SendNotificationDto {
  @IsNotEmpty()
  @IsString()
  deviceToken: string; // Token của thiết bị nhận thông báo

  @IsNotEmpty()
  @IsString()
  title: string; // Tiêu đề thông báo

  @IsNotEmpty()
  @IsString()
  body: string; // Nội dung thông báo
}
