import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from '@prisma/client';
import { hashPasswordHelper } from '@/common/helpers/util';
import { PaginatorTypes, paginator } from '@nodeteam/nestjs-prisma-pagination';
import { PaginationDto } from '@/common/pagination/paginationDto';
import { MailerService } from '@nestjs-modules/mailer';
import { CodeAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const paginate: PaginatorTypes.PaginateFunction = paginator({
  page: 1,
  perPage: 10,
});

@Injectable()
export class UsersService {
  constructor(
    private prisma: DatabaseService,
    private readonly mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async user(userWhereUniqueInput: { email: string }): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(
    dto: PaginationDto,
  ): Promise<PaginatorTypes.PaginatedResult<User>> {
    const { page, perPage, where, orderKey, orderValue } = dto;

    // Chuyển đổi `where` từ string thành Prisma.UserWhereInput
    const prismaWhere: Prisma.UserWhereInput | undefined = where
      ? { name: { contains: where, mode: 'insensitive' } } // Tìm user theo tên
      : undefined;

    // Chọn các trường cần trả về
    const selectFields: Prisma.UserSelect = {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      image: true,
    };

    return paginate(
      this.prisma.user,
      {
        where: prismaWhere,
        orderBy: orderKey ? { [orderKey]: orderValue } : { name: 'asc' },
        select: selectFields,
      },
      {
        page,
        perPage,
      },
    );
  }

  async createUser(data: CreateUserDto): Promise<Partial<User>> {
    const { email, password } = data;

    //check email
    const isExist = await this.isEmailExist({ email });
    if (isExist === true) {
      throw new BadRequestException(
        `Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`,
      );
    }

    //hash password
    const hashPassword = await hashPasswordHelper(password);

    data.password = hashPassword;

    return await this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        image: true,
      },
    });
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<Partial<User>> {
    return await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        phone: true,
        image: true,
      },
    });
  }

  async updatePartial<T>(
    id: number,
    data: Partial<User>,
  ): Promise<{ message: string }> {
    const filteredData = Object.keys(data)
      .filter((key) => data[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    const user = await this.prisma.user.update({
      where: { id },
      data: filteredData,
    });

    return { message: `Cập nhật thành công user: ${user.id}` };
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không tồn tại.`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Xoá người dùng thành công!' };
  }

  async isEmailExist(userWhereUniqueInput: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    if (user) return true;
    return false;
  }

  async handleRegister(data: CreateAuthDto) {
    const { email, password } = data;

    //check email
    const isExist = await this.isEmailExist({ email });
    if (isExist === true) {
      throw new BadRequestException(
        `Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`,
      );
    }

    //hash password
    const hashPassword = await hashPasswordHelper(password);
    data.password = hashPassword;
    const codeId = uuidv4();

    const user = await this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Lưu mã code vào cache
    await this.cacheManager.set(`register-${user.id}`, codeId, 300000); // lưu 5 phút

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account at HoaTran', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    //trả ra phản hồi
    return {
      id: user.id,
    };
  }

  async handleActive(data: CodeAuthDto) {
    const value = await this.cacheManager.get(`register-${data.id}`);

    if (!value) {
      throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
    }

    // Check code
    const isValidCode = value == data.code ? true : false;
    if (!isValidCode) {
      throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật thuộc tính isActive = true của user
    await this.updatePartial(Number(data.id), { isActive: true });

    // Xóa mã code trong cache
    await this.cacheManager.del(`register-${data.id}`);

    return { message: 'Kích hoạt tài khoản thành công!' };
  }
}
