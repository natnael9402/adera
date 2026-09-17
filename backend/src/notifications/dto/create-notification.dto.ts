import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  targetRole?: string; // "ALL", "USER", "BUYER", "ADMIN"

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  type: string; // "DONATION_RECEIVED", "DONATION_VERIFIED", "DONATION_REJECTED", "ORDER_PLACED", "ORDER_ACCEPTED", "ORDER_SHIPPED", "ANNOUNCEMENT", "SYSTEM"

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class BroadcastNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  targetAudience?: string; // "ALL", "BUYERS", "DONORS", "ADMIN"

  @IsOptional()
  @IsString()
  specificEmail?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  link?: string;
}
