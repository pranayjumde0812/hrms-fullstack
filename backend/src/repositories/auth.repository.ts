import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

type UserId = NonNullable<Prisma.UserWhereUniqueInput['id']>;

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = (id: UserId) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, departmentId: true },
  });
};
