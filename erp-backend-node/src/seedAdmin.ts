import bcrypt from 'bcrypt';
import prisma from './prisma/client';

async function seedAdmin() {
  try {
    const adminEmail = 'harisq705@gmail.com';
    const adminPassword = 'bannu@123123';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin exists
    const existingAdmin = await prisma.users.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      // Update password just to be sure
      await prisma.users.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });
      console.log('Admin password updated successfully.');
    } else {
      // Create new admin
      await prisma.users.create({
        data: {
          username: 'admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
