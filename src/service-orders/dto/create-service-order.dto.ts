import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @ApiProperty({ example: '2025-03-10T10:00:00.000Z' }) // Ngày đặt lịch theo ISO format
  scheduledDate: Date; // Ngày đặt lịch

  @IsNotEmpty()
  @ApiProperty({ example: '10:30' }) // Giờ đặt lịch
  scheduledTime: string; // Giờ đặt lịch

  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  customerAddress: number;

  @ApiProperty({ example: 'Khách hàng muốn đến sớm hơn 15 phút' })
  customerNote?: string; // Ghi chú của khách
}

export class ServiceOrderDetailDto {
  @IsNotEmpty()
  @ApiProperty({ example: 101 }) // Mã dịch vụ
  serviceId: number; // Mã dịch vụ

  @ApiProperty({ example: 'pending' }) // Trạng thái đơn hàng
  status?: string; // Trạng thái (mặc định: pending)

  @ApiProperty({
    example: {
      scheduledDate: '2025-03-10T10:00:00.000Z',
      scheduledTime: '10:30',
      customerNote: 'Khách hàng muốn đến sớm hơn 15 phút',
    },
  })
  appointment?: CreateAppointmentDto; // Nếu có đặt lịch
}

export class CreateServiceOrderDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  customerId: number; // Mã khách hàng đặt dịch vụ

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  staffId?: number;

  @IsNotEmpty()
  @ApiProperty({
    example: [
      {
        serviceId: 101,
        status: 'pending',
        appointment: {
          scheduledDate: '2025-03-10T10:00:00.000Z',
          scheduledTime: '10:30',
          customerAddress: 1,
          customerNote: 'Khách hàng muốn đến sớm hơn 15 phút',
        },
      },
      {
        serviceId: 102,
        status: 'pending',
      },
    ],
  })
  details: ServiceOrderDetailDto[]; // Danh sách các dịch vụ được chọn
}
