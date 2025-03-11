import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateAuthDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;

  @ApiProperty({ example: 'Hoa Tran' })
  @IsOptional()
  full_name: string;
}

export class CodeAuthDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  id: number;

  @IsNotEmpty({ message: 'code không được để trống' })
  code: string;
}

export class ChangePasswordAuthDto {
  @IsNotEmpty({ message: 'code không được để trống' })
  code: string;

  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'confirmPassword không được để trống' })
  confirmPassword: string;

  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;
}
