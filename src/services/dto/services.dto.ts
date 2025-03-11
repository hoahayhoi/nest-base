import { ApiProperty } from '@nestjs/swagger';

export class ServicesDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class ServicesTypeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [ServicesDto] })
  services: ServicesDto[];
}
