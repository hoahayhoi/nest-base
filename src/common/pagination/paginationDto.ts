import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 10;

  @IsOptional()
  @IsString()
  where?: string;

  @IsOptional()
  @IsString()
  orderKey?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderValue?: 'asc' | 'desc' = 'desc';
}
