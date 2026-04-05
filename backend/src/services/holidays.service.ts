import { holidaysRepository } from '../repositories';
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
  description?: string;
}) => {
  const holidayDate = getDateFromString(input.holidayDate);
  const existing = await holidaysRepository.findHolidayByDate(holidayDate);

  if (existing) {
    throw new AppError(409, 'A holiday already exists for this date');
  }

  return holidaysRepository.createHoliday({
    name: input.name,
    holidayDate,
    description: input.description,
  });
};

export const deleteHoliday = (id: number) => {
  return holidaysRepository.deleteHoliday(id);
};
