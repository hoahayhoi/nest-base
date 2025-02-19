import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PaginationDto } from '@/common/pagination/paginationDto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorator/customize';

@ApiBearerAuth()
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('/')
  @Public()
  async signupUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Partial<User>> {
    return await this.userService.createUser(createUserDto);
  }

  @Get(':email')
  async getUser(@Param('email') email: string) {
    return await this.userService.user({ email });
  }

  @ApiOperation({ summary: 'Fetch a list of users' })
  @Get()
  async getUsers(@Query() paginationDto: PaginationDto) {
    return await this.userService.users(paginationDto);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    const result = await this.userService.deleteUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}
