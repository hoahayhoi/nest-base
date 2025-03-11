import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedForAppointment() {
  console.log('🔄 Resetting database...');

  // XÓA DỮ LIỆU TRƯỚC KHI SEED
  await prisma.appointment.deleteMany();

  console.log('✅ Database reset successfully!');

  console.log('🌱 Seeding Appointments...');

  // Lấy danh sách chi tiết đơn hàng chưa có lịch hẹn
  const orderDetailsWithoutAppointments =
    await prisma.serviceOrderDetail.findMany({
      where: { appointment: null },
      include: {
        order: {
          include: {
            customer: {
              include: {
                user: { include: { addresses: true } },
              },
            },
          },
        },
      },
    });

  // Tạo danh sách lịch hẹn từ các đơn hàng chưa có lịch
  const appointmentsData = orderDetailsWithoutAppointments
    .map((detail, index) => {
      const customerAddress = detail.order.customer.user.addresses[0]?.id; // Lấy địa chỉ đầu tiên của user

      if (!customerAddress) {
        console.warn(
          `⚠️ Không tìm thấy địa chỉ khách hàng cho đơn hàng ${detail.id}, bỏ qua.`,
        );
        return null; // Trả về null nếu không có địa chỉ
      }

      return {
        order_detail_id: detail.id,
        scheduled_date: new Date(
          new Date().setDate(new Date().getDate() + (index % 7) + 1),
        ), // Lịch hẹn trong 1 tuần tới
        scheduled_time: `${9 + (index % 8)}:00`, // Giờ hẹn ngẫu nhiên từ 9:00 - 16:00
        status: 'pending',
        customer_note: `Customer note for order ${detail.id}`,
        employee_note: null,
        customer_address: customerAddress, // Thêm trường customer_address
      };
    })
    .filter((a) => a !== null); // Loại bỏ các phần tử null

  // Nếu không có dữ liệu hợp lệ, dừng seed
  if (appointmentsData.length === 0) {
    console.log('⚠️ Không có lịch hẹn nào được tạo.');
    return;
  }

  // Chèn dữ liệu vào bảng appointments
  await prisma.appointment.createMany({ data: appointmentsData });

  console.log('✅ Seeding completed successfully!');
}
