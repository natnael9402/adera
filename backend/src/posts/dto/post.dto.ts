import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  goal: number;

  @IsOptional()
  @IsNumber()
  raised?: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsString()
  cryptoPayoutAddress?: string;

  @IsOptional()
  @IsString()
  cryptoPayoutSymbol?: string;

  @IsOptional()
  @IsString()
  beneficiary?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  impactMilestones?: any;
}

export class UpdatePostStatusDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}

export class ActivatePostDto {
  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  paymentProofImage?: string;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsString()
  cryptoSymbol?: string;
}

export class AdminUpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  goal?: number;

  @IsOptional()
  @IsNumber()
  raised?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  activationStatus?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  beneficiary?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class DonateToPostDto {
  @IsOptional()
  @IsString()
  donorName?: string;

  @IsOptional()
  @IsString()
  donorEmail?: string;

  @IsNumber()
  amountUsd: number;

  @IsString()
  cryptoAmount: string;

  @IsString()
  cryptoSymbol: string;

  @IsString()
  txHash: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class AddPostUpdateDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class GenerateDescriptionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  beneficiary?: string;

  @IsOptional()
  @IsNumber()
  goal?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  additionalDetails?: string;
}
