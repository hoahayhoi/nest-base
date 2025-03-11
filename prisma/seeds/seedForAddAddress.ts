import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedForAddAddress() {
  console.log('🔄 Resetting database...');

  // XÓA DỮ LIỆU TRƯỚC KHI SEED
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  console.log('✅ Database reset successfully!');

  // Tạo dữ liệu cho Branch
  console.log('🌱 Seeding Branch...');
  await prisma.branch.createMany({
    data: [
      { name: 'Branch A' },
      { name: 'Branch B' },
      { name: 'Branch C' },
      { name: 'Branch D' },
      { name: 'Branch E' },
    ],
  });

  const allBranches = await prisma.branch.findMany();

  // Tạo User (Mã hóa password)
  console.log('🌱 Seeding Users...');
  const users = await Promise.all(
    [...Array(5)].map(async (_, index) => {
      return prisma.user.create({
        data: {
          full_name: `User ${index + 1}`,
          email: `user${index + 1}@example.com`,
          password: await bcrypt.hash('password123', 10),
          avatar_url: null,
          account_type: 'local',
          role: index % 2 === 0 ? 'customer' : 'staff',
          branch_id: allBranches[index % allBranches.length].id,
        },
      });
    }),
  );

  // Tạo UserAddress
  console.log('🌱 Seeding User Addresses...');
  await prisma.userAddress.createMany({
    data: users.map((user, index) => ({
      user_id: user.id,
      phone: `012345678${index}`,
      address: `Address ${index + 1}`,
    })),
  });

  // Tạo Customer và Staff
  console.log('🌱 Seeding Customers and Staff...');
  await Promise.all(
    users.map((user) =>
      user.role === 'customer'
        ? prisma.customer.create({ data: { user_id: user.id } })
        : prisma.staff.create({ data: { user_id: user.id } }),
    ),
  );

  console.log('✅ Seeding completed successfully!');
}
