import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;
}

export class ContactMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Topic is required' })
  topic: string;

  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  message: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email: string;
}

export class SendDirectEmailDto {
  @IsEmail({}, { message: 'Please provide a valid recipient email address' })
  @IsNotEmpty({ message: 'Recipient email address is required' })
  recipient: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Email subject is required' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Email message content is required' })
  @MinLength(5, { message: 'Message must be at least 5 characters' })
  message: string;

  @IsString()
  @IsOptional()
  category?: string;
}

