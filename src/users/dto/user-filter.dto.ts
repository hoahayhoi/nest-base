import { IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class UserFilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip?: number = 1; // Giá trị mặc định

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take?: number = 10; // Giới hạn số bản ghi mặc định

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  cursor?: Prisma.UserWhereUniqueInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  where?: Prisma.UserWhereInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  orderBy?: Prisma.UserOrderByWithRelationInput;
}
