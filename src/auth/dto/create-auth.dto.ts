import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the account (min 6 characters)',
    example: 'strongPass123!',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  password: string;

  @ApiPropertyOptional({
    description: 'Corporation name (optional)',
    example: 'TechCorp Inc.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  corporationName?: string;
}
