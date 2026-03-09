import { user_role } from 'prisma/generated/prisma/enums';

export interface IPayload {
  id: number;
  role: user_role;
}

export interface IRequest extends Request {
  user: IPayload;
}

export interface IQuery {
  page: string;
  limit: string;
}

// query user
export interface IUserQuery extends IQuery {
  companyId: string;
}

// query worker
export interface IWorkerQuery extends IQuery {
  userId: string;
  companyId: string;
}

// query filial
export interface IFilialQuery extends IQuery {
  companyId: string;
}

// query department
export interface IDepartmentQuery extends IQuery {
  companyId: string;
}

// query position
export interface IPositionQuery extends IQuery {
  companyId: string;
}

// query day
export interface IDayQuery extends IQuery {
  companyId: string;
}

// query schedule
export interface IScheduleQuery extends IQuery {
  dayId: string;
}
