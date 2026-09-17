export class QueryActivityLogDto {
  type?: string;
  status?: string;
  userId?: number;
  search?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}
