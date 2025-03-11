import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'This is field is required',
    required: true,
    example: 'email.example@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
    example: '123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    required: true,
    example: '123456',
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  avatar_url?: string;

  @ApiProperty()
  @IsString()
  full_name: string;

  @IsString()
  @IsOptional()
  role: string = 'customer';

  @IsString()
  @IsOptional()
  accountType: string = 'local';
}
