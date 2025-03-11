import { seedForAddAddress } from './seeds/seedForAddAddress';
import { seedForAppointment } from './seeds/seedForAppointment';
import { seedForDevice } from './seeds/seedForDevice';
import { seedForOrderService } from './seeds/seedForOrderService';

async function main() {
  console.log('🚀 Running seeds...');
  // await seedForAddAddress();
  // await seedForOrderService();
  // await seedForAppointment();
  await seedForDevice();
  console.log('✅ All seeds executed successfully!');
}

main().catch((e) => {
  console.error('❌ Seeding error:', e);
  process.exit(1);
});
