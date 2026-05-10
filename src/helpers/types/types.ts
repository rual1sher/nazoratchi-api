import { penalty_type, user_role } from 'prisma/generated/prisma/enums';

export interface IPayload {
  id: number;
  role: user_role;
}

export interface IRequest extends Request {
  user: IPayload;
}

export interface IQuery {
  search: string;
  page: string;
  limit: string;
}

// query user
export interface IUserQuery extends IQuery {
  companyId: string;
}

// query worker
export interface IWorkerQuery extends IQuery {
  userId?: string;
  companyId?: string;
  positionId?: string;
  departmant?: string;
  scheduleId?: string;
}

// query filial
export interface IFilialQuery extends IQuery {
  companyId?: string;
}

// query position
export interface IPositionQuery extends IQuery {
  departmentId?: string;
}

// query day
export interface IDayQuery extends IQuery {
  scheduleId?: string;
}

// query schedule
export interface IScheduleQuery extends IQuery {
  workerId?: string;
}

// query penaltys-name
export interface IPenaltysNameQuery extends IQuery {
  companyId?: string;
}

// query penalty
export interface IPenaltyQuery extends IQuery {
  penaltysNameId?: string;
  type?: string;
}

// query payment
export interface IPaymentQuery extends IQuery {
  workerId?: string;
  type?: penalty_type;
}

// query attendance
export interface IAttendanceQuery extends IQuery {
  workerId?: string;
}

// query salary
export interface ISalaryQuery extends IQuery {
  workerId?: string;
}

// query task
export interface ITaskQuery extends IQuery {
  workerId?: string;
}

// query holiday
export interface IHolidayQuery extends IQuery {
  filialId?: string;
  departmentId?: string;
  /** adaptive | free — праздник, привязанный к этому типу графика */
  scheduleType?: string;
}
