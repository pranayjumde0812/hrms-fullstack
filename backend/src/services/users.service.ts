import { Role } from '@prisma/client';
import { usersRepository } from '../repositories';
import { CreateUserData, UpdateUserData } from '../repositories/users.repository';
import { AppError } from '../utils/http';

export const listUsers = () => {
  return usersRepository.listUsers();
};

export const createUser = async (data: CreateUserData) => {
  const existing = await usersRepository.findUserByEmail(data.email);

  if (existing) {
    throw new AppError(400, 'Email already exists');
  }

  const user = await usersRepository.createUser(data);
  const { password, ...safeUser } = user;
  return safeUser;
};

export const getUserById = async (userId: number, authedUser: { id: number; role: Role }) => {
  if (authedUser.id !== userId && !['SUPER_ADMIN', 'HR_MANAGER'].includes(authedUser.role)) {
    throw new AppError(403, 'Access denied');
  }

  const user = await usersRepository.findUserByIdWithDepartment(userId);

  if (!user) {
    throw new AppError(404, 'Not found');
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

export const updateUser = async (userId: number, data: UpdateUserData) => {
  const user = await usersRepository.updateUser(userId, data);
  const { password, ...safeUser } = user;
  return safeUser;
};

export const deleteUser = async (userId: number, authedUserId: number) => {
  if (authedUserId === userId) {
    throw new AppError(400, 'Cannot delete yourself');
  }

  await usersRepository.deleteUser(userId);
};
