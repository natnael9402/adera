import { IsString, IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class RegisterResellerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  handle?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  walletAddress?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class LoginResellerDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ImportProductDto {
  @IsNotEmpty()
  productId: number;

  @IsNotEmpty()
  customPrice: number;
}

export class UpdateResellerProductDto {
  @IsOptional()
  customPrice?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpgradeTierDto {
  @IsString()
  @IsIn(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}
