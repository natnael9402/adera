import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(1)
  amountUsd: number;

  @IsString()
  @IsNotEmpty()
  cryptoSymbol: string;

  @IsString()
  @IsNotEmpty()
  cryptoAmount: string;

  @IsString()
  @IsNotEmpty()
  txHash: string;

  @IsString()
  @IsOptional()
  paymentProof?: string;

  @IsString()
  @IsOptional()
  donorEmail?: string;
}

export class WalletDonateDto {
  @IsNumber()
  causeId: number;

  @IsNumber()
  @Min(1)
  amountUsd: number;

  @IsOptional()
  isAnonymous?: boolean;

  @IsString()
  @IsOptional()
  donorName?: string;

  @IsString()
  @IsOptional()
  donorEmail?: string;
}
