import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedForOrderService() {
  console.log('🔄 Resetting database...');

  // XÓA DỮ LIỆU TRƯỚC KHI SEED
  await prisma.review.deleteMany();
  await prisma.serviceOrderDetail.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.serviceServiceType.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceType.deleteMany();

  console.log('✅ Database reset successfully!');

  // Tạo ServiceType
  console.log('🌱 Seeding Service Types...');
  await prisma.serviceType.createMany({
    data: [
      { name: 'Plumbing' },
      { name: 'Electrical' },
      { name: 'Cleaning' },
      { name: 'Pest Control' },
      { name: 'Landscaping' },
    ],
  });

  // Tạo Service
  console.log('🌱 Seeding Services...');
  await prisma.service.createMany({
    data: [
      { name: 'Pipe Fixing' },
      { name: 'House Wiring' },
      { name: 'Carpet Cleaning' },
      { name: 'Termite Treatment' },
      { name: 'Garden Maintenance' },
    ],
  });

  const allServiceTypes = await prisma.serviceType.findMany();
  const allServices = await prisma.service.findMany();

  // Tạo liên kết giữa Service và ServiceType
  console.log('🌱 Seeding Service - ServiceType relationships...');
  await prisma.serviceServiceType.createMany({
    data: allServices.map((service, index) => ({
      service_id: service.id,
      service_type_id: allServiceTypes[index % allServiceTypes.length].id,
    })),
  });

  // Tạo đơn hàng dịch vụ
  console.log('🌱 Seeding Service Orders...');
  const customers = await prisma.customer.findMany();
  const staffs = await prisma.staff.findMany();

  const orders = await prisma.serviceOrder.createMany({
    data: customers.slice(0, 5).map((customer, index) => ({
      customer_id: customer.id,
      order_date: new Date(),
      staff_id: staffs[index % staffs.length]?.id || null,
    })),
  });

  const allOrders = await prisma.serviceOrder.findMany();

  // Tạo chi tiết đơn hàng
  console.log('🌱 Seeding Service Order Details...');
  const orderDetails = await prisma.serviceOrderDetail.createMany({
    data: allOrders.map((order, index) => ({
      order_id: order.id,
      service_id: allServices[index % allServices.length].id,
      status: index % 2 === 0 ? 'completed' : 'pending',
    })),
  });

  const allOrderDetails = await prisma.serviceOrderDetail.findMany();

  // Tạo đánh giá cho đơn hàng đã hoàn thành
  console.log('🌱 Seeding Reviews...');
  await prisma.review.createMany({
    data: allOrderDetails
      .filter((detail) => detail.status === 'completed')
      .map((detail, index) => ({
        order_detail_id: detail.id,
        customer_id: detail.order_id,
        rating: Math.floor(Math.random() * 5) + 1,
        message: `Review message ${index + 1}`,
        media_urls: [`https://example.com/review${index + 1}.jpg`],
      })),
  });

  console.log('✅ Seeding completed successfully!');
}
