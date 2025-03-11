import { Injectable } from '@nestjs/common';
import {
  CreateNotificationDto,
  SendNotificationDto,
  SendNotificationToUsersDto,
} from './dto/create-notification.dto';
import { UpdateUserNotificationDto } from './dto/update-notification.dto';
import { DatabaseService } from '@/database/database.service';
import { DevicesService } from '@/devices/devices.service';
import { FirebaseService } from '@/firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: DatabaseService,
    private devicesService: DevicesService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Tạo thông báo mới
   * @param createNotificationDto Thông tin thông báo
   */
  async create(createNotificationDto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: {
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        image_url: createNotificationDto.image_url,
        action_url: createNotificationDto.action_url,
        sent_by: createNotificationDto.sent_by,
        status: createNotificationDto.status || 'pending',
      },
    });
  }

  /**
   * Gửi thông báo tới các thiết bị của các người dùng
   * @param dto Đối tượng chứa ID thông báo và danh sách ID người dùng
   */
  async sendNotificationToUsers(dto: SendNotificationToUsersDto) {
    const notification = await this.getNotificationById(dto.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return await this.prisma.$transaction(async (prisma) => {
      let isSent = false;

      for (const userId of dto.userIds) {
        const devices = await this.devicesService.getDevices(userId);

        if (devices.length === 0) {
          throw new Error(`No devices found for user ${userId}`);
        }

        const activeDevices = devices.filter(
          (device) => device.status === 'active',
        );

        const sendResults = await Promise.all(
          activeDevices.map(async (device) => {
            const result = await this.sendNotificationToDevice({
              deviceToken: device.device_token,
              title: notification.title,
              body: notification.message,
            });

            await prisma.userNotification.create({
              data: {
                notification_id: dto.notificationId,
                customerID: userId,
                device_id: device.device_id,
                delivered_at: result.success ? new Date() : null,
                status: result.success ? 'sent' : 'failed',
              },
            });

            return result.success;
          }),
        );

        if (sendResults.includes(true)) {
          isSent = true;
        }
      }

      return prisma.notification.update({
        where: { notification_id: dto.notificationId },
        data: { status: isSent ? 'sent' : 'failed' },
      });
    });
  }

  /**
   * Gửi thông báo đến thiết bị
   * @param dto Đối tượng chứa token của thiết bị , title, nội dung thông báo
   */
  async sendNotificationToDevice(dto: SendNotificationDto) {
    const messaging = this.firebaseService.getMessaging();

    const message = {
      notification: {
        title: dto.title,
        body: dto.body,
      },
      token: dto.deviceToken, // Token của thiết bị nhận thông báo
    };

    try {
      const response = await messaging.send(message);
      console.log('Notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy thông báo theo ID
   * @param id ID thông báo
   */
  async getNotificationById(id: number) {
    return await this.prisma.notification.findUnique({
      where: {
        notification_id: id,
      },
    });
  }

  /**
   * Cập nhật trạng thái của user notification khi người dùng xem thông báo
   * @param updateUserNotificationDto Là đối tượng chứa ID notification, ID người dùng, ID thiết bị
   */
  async updateUserNotificationStatus(dto: UpdateUserNotificationDto) {
    const { notificationId, userId, deviceId } = dto;

    const updated = await this.prisma.userNotification.updateMany({
      where: {
        notification_id: notificationId,
        customerID: userId,
        device_id: deviceId, // Đảm bảo cập nhật đúng thiết bị
      },
      data: {
        status: 'read', // Đánh dấu thông báo đã đọc
        read_at: new Date(), // Lưu thời gian đọc (nếu có)
      },
    });

    return {
      message:
        updated.count > 0
          ? 'Notification status updated'
          : 'No matching notification found',
      updatedCount: updated.count,
    };
  }
  // create(createNotificationDto: CreateNotificationDto) {
  //   return 'This action adds a new notification';
  // }

  // findAll() {
  //   return `This action returns all notifications`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} notification`;
  // }

  // update(id: number, updateNotificationDto: UpdateNotificationDto) {
  //   return `This action updates a #${id} notification`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} notification`;
  // }
}
