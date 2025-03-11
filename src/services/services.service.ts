import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { DatabaseService } from '@/database/database.service';
import { ServicesDto, ServicesTypeDto } from './dto/services.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: DatabaseService) {}
  create(createServiceDto: CreateServiceDto) {
    return 'This action adds a new service';
  }

  findAll() {
    return `This action returns all services`;
  }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }

  async getAllServices(): Promise<ServicesDto[]> {
    return this.prisma.service.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getAllServiceTypes(): Promise<ServicesTypeDto[]> {
    return this.prisma.serviceType
      .findMany({
        include: {
          services: {
            select: {
              service: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })
      .then((serviceTypes) =>
        serviceTypes.map((type) => ({
          id: type.id,
          name: type.name,
          services: type.services.map((s) => s.service),
        })),
      );
  }
}
