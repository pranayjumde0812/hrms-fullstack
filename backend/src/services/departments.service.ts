import { departmentsRepository } from '../repositories';
import { AppError } from '../utils/http';

export const listDepartments = () => {
  return departmentsRepository.listDepartments();
};

export const createDepartment = async (data: { name: string; description?: string }) => {
  const existing = await departmentsRepository.findDepartmentByName(data.name);

  if (existing) {
    throw new AppError(400, 'Department already exists');
  }

  return departmentsRepository.createDepartment(data);
};

export const updateDepartment = (id: number, data: { name: string; description?: string }) => {
  return departmentsRepository.updateDepartment(id, data);
};

export const deleteDepartment = (id: number) => {
  return departmentsRepository.deleteDepartment(id);
};
