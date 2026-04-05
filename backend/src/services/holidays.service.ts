import { holidaysRepository, workLocationsRepository } from '../repositories';
import { AppError } from '../utils/http';

const getDateFromString = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const listHolidays = (input?: { month?: number; year?: number }) => {
  if (!input?.month || !input?.year) {
    return holidaysRepository.listHolidays();
  }

  const from = new Date(input.year, input.month - 1, 1);
  const to = new Date(input.year, input.month, 0);
  return holidaysRepository.listHolidays(from, to);
};

export const createHoliday = async (input: {
  name: string;
  holidayDate: string;
  workLocationId?: number | null;
  isOptional?: boolean;
  description?: string;
}) => {
  const holidayDate = getDateFromString(input.holidayDate);
  if (input.workLocationId != null) {
    const workLocation = await workLocationsRepository.findWorkLocationById(input.workLocationId);
    if (!workLocation) {
      throw new AppError(404, 'Work location not found');
    }
  }

  const existing = await holidaysRepository.findHolidayByDate(holidayDate, input.workLocationId);

  if (existing) {
    throw new AppError(409, 'A holiday already exists for this date');
  }

  return holidaysRepository.createHoliday({
    name: input.name,
    holidayDate,
    workLocation: input.workLocationId != null ? { connect: { id: input.workLocationId } } : undefined,
    isOptional: input.isOptional ?? false,
    description: input.description,
  });
};

export const deleteHoliday = (id: number) => {
  return holidaysRepository.deleteHoliday(id);
};
