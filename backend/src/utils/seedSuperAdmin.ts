import prisma from './prisma';

const DEFAULT_SUPER_ADMIN = {
  email: 'admin@nexushr.com',
  password: 'admin123',
  firstName: 'Super',
  lastName: 'Admin',
};

export const seedSuperAdminIfNeeded = async () => {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return;
  }

  const email = process.env.SUPER_ADMIN_EMAIL || DEFAULT_SUPER_ADMIN.email;
  const password = process.env.SUPER_ADMIN_PASSWORD || DEFAULT_SUPER_ADMIN.password;
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME || DEFAULT_SUPER_ADMIN.firstName;
  const lastName = process.env.SUPER_ADMIN_LAST_NAME || DEFAULT_SUPER_ADMIN.lastName;

  await prisma.user.create({
    data: {
      email,
      password,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      joiningDate: new Date(),
    },
  });

  console.log(`Seeded super admin user: ${email}`);
};
