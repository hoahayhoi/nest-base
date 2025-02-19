import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

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
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role: string = 'USER';

  @IsString()
  @IsOptional()
  accountType: string = 'LOCAL';

  @IsBoolean()
  @IsOptional()
  isActive: boolean = false;
}
