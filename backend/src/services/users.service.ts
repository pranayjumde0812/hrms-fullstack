import { Role } from '@prisma/client';
import { usersRepository, workLocationsRepository } from '../repositories';
import { CreateUserData, UpdateUserData } from '../repositories/users.repository';
import { AppError } from '../utils/http';

const MANAGER_ROLES: Role[] = ['SUPER_ADMIN', 'HR_MANAGER', 'PROJECT_MANAGER'];

const validateManagerAssignment = async ({
  managerId,
  userId,
  role,
}: {
  managerId?: number | null;
  userId?: number;
  role?: Role;
}) => {
  if (role === 'SUPER_ADMIN' && managerId != null) {
    throw new AppError(400, 'Super Admin cannot have a reporting manager');
  }

  if (managerId == null) {
    return;
  }

  if (userId != null && managerId === userId) {
    throw new AppError(400, 'Employee cannot report to themselves');
  }

  const manager = await usersRepository.findUserById(managerId);

  if (!manager) {
    throw new AppError(404, 'Reporting manager not found');
  }

  if (!MANAGER_ROLES.includes(manager.role)) {
    throw new AppError(400, 'Selected reporting manager must be a manager, HR, or Super Admin');
  }
};

export const listUsers = () => {
  return usersRepository.listUsers();
};

export const createUser = async (data: CreateUserData) => {
  const [existingEmail, existingEmployeeCode] = await Promise.all([
    usersRepository.findUserByEmail(data.email),
    data.employeeCode ? usersRepository.findUserByEmployeeCode(data.employeeCode) : Promise.resolve(null),
  ]);

  if (existingEmail) {
    throw new AppError(400, 'Email already exists');
  }

  if (existingEmployeeCode) {
    throw new AppError(400, 'Employee code already exists');
  }

  await validateManagerAssignment({
    managerId: data.managerId,
    role: data.role,
  });

  if (data.workLocationId != null) {
    const workLocation = await workLocationsRepository.findWorkLocationById(data.workLocationId);
    if (!workLocation) {
      throw new AppError(404, 'Work location not found');
    }
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
  const existingUser = await usersRepository.findUserById(userId);

  if (!existingUser) {
    throw new AppError(404, 'User not found');
  }

  await validateManagerAssignment({
    managerId: data.managerId,
    userId,
    role: data.role ?? existingUser.role,
  });

  if (data.employeeCode && data.employeeCode !== existingUser.employeeCode) {
    const conflict = await usersRepository.findUserByEmployeeCode(data.employeeCode);
    if (conflict) {
      throw new AppError(400, 'Employee code already exists');
    }
  }

  if (data.workLocationId != null) {
    const workLocation = await workLocationsRepository.findWorkLocationById(data.workLocationId);
    if (!workLocation) {
      throw new AppError(404, 'Work location not found');
    }
  }

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
