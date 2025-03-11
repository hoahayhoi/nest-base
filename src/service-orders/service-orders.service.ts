import { Injectable } from '@nestjs/common';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { DatabaseService } from '@/database/database.service';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private prisma: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}
  /**
   * Tạo đơn hàng dịch vụ mới
   * @param dto Thông tin đơn hàng
   */
  async createServiceOrder(dto: CreateServiceOrderDto) {
    return this.prisma.$transaction(async (prisma) => {
      try {
        // 1. Tạo đơn hàng (`ServiceOrder`)
        const serviceOrder = await prisma.serviceOrder.create({
          data: {
            customer_id: dto.customerId,
            staff_id: dto.staffId || null,
          },
        });

        // 2. Tạo chi tiết đơn hàng (`ServiceOrderDetail`)
        for (const detail of dto.details) {
          const serviceOrderDetail = await prisma.serviceOrderDetail.create({
            data: {
              order_id: serviceOrder.id,
              service_id: detail.serviceId,
              status: detail.status || 'pending',
            },
          });

          // 3. Nếu có đặt lịch, tạo `Appointment`
          if (detail.appointment) {
            const scheduledDate = detail.appointment?.scheduledDate
              ? new Date(detail.appointment.scheduledDate)
              : null;

            if (!scheduledDate || isNaN(scheduledDate.getTime())) {
              throw new Error('Ngày hẹn không hợp lệ');
            }

            await prisma.appointment.create({
              data: {
                order_detail_id: serviceOrderDetail.id,
                scheduled_date: scheduledDate,
                scheduled_time: detail.appointment.scheduledTime,
                customer_address: detail.appointment.customerAddress,
                customer_note: detail.appointment.customerNote || null,
              },
            });
          }
        }

        // 4. Tạo thông báo trong transaction
        const notification = await prisma.notification.create({
          data: {
            title: 'Đặt dịch vụ thành công',
            message: `Đơn hàng #${serviceOrder.id} đã được tạo thành công`,
            sent_by: 0, // System
            status: 'pending',
          },
        });

        // 5. Gửi thông báo ngoài transaction (để tránh rollback toàn bộ nếu lỗi)
        const data = this.notificationsService
          .sendNotificationToUsers({
            notificationId: notification.notification_id, // Đảm bảo đúng ID
            userIds: [dto.customerId],
          })
          .catch((err) => {
            console.error('Lỗi gửi thông báo:', err);
          });

        // 6. Trả về kết quả
        return {
          message: 'Đặt dịch vụ thành công',
          orderId: serviceOrder.id,
          notificationInfor: data,
        };
      } catch (error) {
        console.error('Lỗi khi tạo đơn hàng dịch vụ:', error);
        throw new Error('Đặt dịch vụ thất bại. Vui lòng thử lại.');
      }
    });
  }
  // findAll() {
  //   return `This action returns all serviceOrders`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} serviceOrder`;
  // }
  // update(id: number, updateServiceOrderDto: UpdateServiceOrderDto) {
  //   return `This action updates a #${id} serviceOrder`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} serviceOrder`;
  // }
}
