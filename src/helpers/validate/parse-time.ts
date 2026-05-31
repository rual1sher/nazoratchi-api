import { BadRequestException } from '@nestjs/common';

const TIME_24H_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const toTimeOnlyDate = (hours: number, minutes: number, seconds = 0, ms = 0) =>
  new Date(
    Date.UTC(1970, 0, 1, hours, minutes, seconds, ms),
  );

export const parseTimeToDate = (
  value: string,
  fieldName = 'time',
): Date => {
  if (TIME_24H_REGEX.test(value)) {
    const normalized = value.padStart(5, '0');
    const [hours, minutes] = normalized.split(':').map(Number);
    return toTimeOnlyDate(hours, minutes);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(
      `${fieldName} must be a valid ISO 8601 timestamp`,
    );
  }

  return toTimeOnlyDate(
    parsed.getUTCHours(),
    parsed.getUTCMinutes(),
    parsed.getUTCSeconds(),
    parsed.getUTCMilliseconds(),
  );
};
