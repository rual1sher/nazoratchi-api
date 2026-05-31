import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';

@Injectable()
export class AttendancePenaltyCron {
  private readonly logger = new Logger(AttendancePenaltyCron.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  /** Every day at 00:00 — finalize yesterday's attendance penalties. */
  @Cron('0 0 * * *')
  async handleMidnight() {
    try {
      const result = await this.attendanceService.processDailyPenalties();
      this.logger.log(
        `Daily penalties: ${result.paymentsCreated} payment(s) for ${result.date}`,
      );
    } catch (err) {
      this.logger.error('Daily attendance penalty cron failed', err);
    }
  }
}
