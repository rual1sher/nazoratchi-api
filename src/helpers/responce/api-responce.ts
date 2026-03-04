import { Pagination } from '../pagination/pagination';

export class ApiResponse {
  data: any;
  status: number;
  pagination: Pagination | null;
  date: Date;

  constructor(data: any, status?: number, pagination?: Pagination) {
    this.data = data;
    this.status = status || 200;
    this.pagination = pagination || null;
    this.date = new Date();
  }
}
