export class CreateActivityLogDto {
  type: string;
  actorName?: string;
  actorEmail?: string;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  summary: string;
  details?: any;
  status?: string; // 'SUCCESS' | 'FAILED' | 'WARNING' | 'INFO'
}
