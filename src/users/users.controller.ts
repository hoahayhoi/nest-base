import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PaginationDto } from '@/common/pagination/paginationDto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Public } from '@/common/decorator/customize';
import {
  CreateUserAddressDto,
  DeleteUserAddressDto,
} from './dto/add-address.dto';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/address')
  async createAddress(@Body() createUserAddressDto: CreateUserAddressDto) {
    return await this.userService.createUserAddress(createUserAddressDto);
  }

  @Delete('/address')
  async deleteAddress(@Body() data: DeleteUserAddressDto) {
    return await this.userService.deleteUserAddress(data);
  }

  @Get('/address/:userId')
  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của người dùng' })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'ID của người dùng cần lấy danh sách địa chỉ',
    example: 10,
  })
  async getAddress(@Param('userId') userId: number) {
    return await this.userService.getUserAddresses(userId);
  }
  // @Post('/')
  // @Public()
  // async signupUser(
  //   @Body() createUserDto: CreateUserDto,
  // ): Promise<Partial<User>> {
  //   return await this.userService.createUser(createUserDto);
  // }

  // @ApiOperation({ summary: 'Fetch a list of users' })
  // @Get()
  // async getUsers(@Query() paginationDto: PaginationDto) {
  //   return await this.userService.users(paginationDto);
  // }

  // @Patch(':id')
  // async updateUser(
  //   @Param('id') id: number,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return await this.userService.updatePartial(Number(id), updateUserDto);
  // }

  // @Delete(':id')
  // async deleteUser(@Param('id') id: number) {
  //   const result = await this.userService.deleteUser(id);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: result.message,
  //   };
  // }
}
