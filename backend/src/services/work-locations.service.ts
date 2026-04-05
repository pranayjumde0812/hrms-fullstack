import { workLocationsRepository } from '../repositories';
import { AppError } from '../utils/http';

export const listWorkLocations = () => {
  return workLocationsRepository.listWorkLocations();
};

export const createWorkLocation = async (data: {
  name: string;
  code: string;
  timeZone: string;
  address?: string;
  isActive?: boolean;
}) => {
  const [existingByName, existingByCode] = await Promise.all([
    workLocationsRepository.findWorkLocationByName(data.name),
    workLocationsRepository.findWorkLocationByCode(data.code),
  ]);

  if (existingByName) {
    throw new AppError(400, 'Work location name already exists');
  }

  if (existingByCode) {
    throw new AppError(400, 'Work location code already exists');
  }

  return workLocationsRepository.createWorkLocation(data);
};

export const updateWorkLocation = async (
  id: number,
  data: {
    name?: string;
    code?: string;
    timeZone?: string;
    address?: string | null;
    isActive?: boolean;
  },
) => {
  const existing = await workLocationsRepository.findWorkLocationById(id);

  if (!existing) {
    throw new AppError(404, 'Work location not found');
  }

  if (data.name && data.name !== existing.name) {
    const conflict = await workLocationsRepository.findWorkLocationByName(data.name);
    if (conflict) {
      throw new AppError(400, 'Work location name already exists');
    }
  }

  if (data.code && data.code !== existing.code) {
    const conflict = await workLocationsRepository.findWorkLocationByCode(data.code);
    if (conflict) {
      throw new AppError(400, 'Work location code already exists');
    }
  }

  return workLocationsRepository.updateWorkLocation(id, data);
};

export const deleteWorkLocation = async (id: number) => {
  const existing = await workLocationsRepository.findWorkLocationById(id);

  if (!existing) {
    throw new AppError(404, 'Work location not found');
  }

  return workLocationsRepository.deleteWorkLocation(id);
};
