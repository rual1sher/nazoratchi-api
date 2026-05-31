import { BadRequestException } from '@nestjs/common';

const TIME_24H_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const parseTimeToDate = (
  value: string,
  fieldName = 'time',
): Date => {
  if (!TIME_24H_REGEX.test(value)) {
    throw new BadRequestException(
      `${fieldName} must be in HH:mm format (00:00 - 23:59)`,
    );
  }

  const normalized = value.padStart(5, '0');
  const parsed = new Date(`1970-01-01T${normalized}:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${fieldName} is invalid`);
  }

  return parsed;
};
