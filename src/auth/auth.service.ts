import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CodeAuthDto, CreateAuthDto } from './dto/create-auth.dto';
import { comparePasswordHelper } from '@/common/helpers/util';
import { UsersService } from '@/users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.client = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID_MOBILE') || '',
    );
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.user({ email: username });
    if (!user) return null;

    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) return null;
    return user;
  }

  login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async setCache(key: string, value: string) {
    await this.cacheManager.set(key, value, 600000);
  }

  async getCache(key: string): Promise<any> {
    const value = await this.cacheManager.get(key);
    return value;
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }

  // async checkCode(data: CodeAuthDto) {
  //   return await this.usersService.handleActive(data);
  // }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.client._clientId,
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Tạo JWT từ thông tin user
      const jwt = this.jwtService.sign(user);

      return { jwt, user };
    } catch (error) {
      console.log({ error });
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
