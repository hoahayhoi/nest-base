import { IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class PostFilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  skip?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take?: number = 10;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  cursor?: Prisma.PostWhereUniqueInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  where?: Prisma.PostWhereInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  orderBy?: Prisma.PostOrderByWithRelationInput;
}
