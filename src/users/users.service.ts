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
import {
  CreateUserAddressDto,
  DeleteUserAddressDto,
} from './dto/add-address.dto';

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
      ? { full_name: { contains: where, mode: 'insensitive' } } // Tìm user theo tên
      : undefined;

    // Chọn các trường cần trả về
    const selectFields: Prisma.UserSelect = {
      id: true,
      full_name: true,
      email: true,
      avatar_url: true,
    };

    return paginate(
      this.prisma.user,
      {
        where: prismaWhere,
        orderBy: orderKey ? { [orderKey]: orderValue } : { full_name: 'asc' },
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
        full_name: true,
        avatar_url: true,
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
        full_name: true,
        avatar_url: true,
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
        full_name: true,
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
        name: user?.full_name ?? user.email,
        activationCode: codeId,
      },
    });
    //trả ra phản hồi
    return {
      id: user.id,
    };
  }

  async createUserAddress(data: CreateUserAddressDto) {
    // Lấy danh sách địa chỉ của user từ database
    const userAddresses = await this.getUserAddresses(data.id);
    // Kiểm tra nếu đã có 3 địa chỉ thì không cho thêm mới
    if (userAddresses.length >= 3) {
      throw new BadRequestException(
        'Người dùng chỉ có thể có tối đa 3 địa chỉ.',
      );
    }
    // Kiểm tra xem địa chỉ mới có bị trùng với địa chỉ đã có không
    const isDuplicate = userAddresses.some(
      (address) =>
        address.address === data.address && address.phone === data.phone,
    );

    if (isDuplicate) {
      throw new BadRequestException(`Địa chỉ và số điện thoại đã tồn tại!.`);
    }

    await this.prisma.userAddress.create({
      data: {
        user_id: data.id,
        phone: data.phone,
        address: data.address,
      },
    });
    return { message: 'Thêm địa chỉ thành công!' };
  }

  async deleteUserAddress(data: DeleteUserAddressDto) {
    // Kiểm tra xem địa chỉ có tồn tại và thuộc về user không
    const address = await this.prisma.userAddress.findUnique({
      where: { id: data.id },
    });

    if (!address || address.user_id !== data.userId) {
      throw new BadRequestException(
        'Địa chỉ không tồn tại hoặc không thuộc về người dùng.',
      );
    }

    // Xoá địa chỉ
    await this.prisma.userAddress.delete({
      where: { id: data.id },
    });

    return { message: 'Đã xoá địa chỉ thành công!' };
  }

  async getUserAddresses(userId: number) {
    // Lấy danh sách tất cả các địa chỉ của user từ database
    const userAddresses = await this.prisma.userAddress.findMany({
      where: { user_id: userId },
    });

    // Nếu user không có địa chỉ nào, có thể trả về thông báo hoặc danh sách rỗng
    if (!userAddresses.length) {
      throw new NotFoundException('Người dùng chưa có địa chỉ nào.');
    }

    return userAddresses;
  }
}
