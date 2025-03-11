import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return this.serviceOrdersService.createServiceOrder(createServiceOrderDto);
  }

  // @Get()
  // findAll() {
  //   return this.serviceOrdersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.serviceOrdersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateServiceOrderDto: UpdateServiceOrderDto) {
  //   return this.serviceOrdersService.update(+id, updateServiceOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.serviceOrdersService.remove(+id);
  // }
}
