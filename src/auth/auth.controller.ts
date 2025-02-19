import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/guard/local-auth.guard';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
  LoginDto,
} from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Public, ResponseMessage } from '@/common/decorator/customize';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  @Get('me')
  getAccountInfor(@Request() request) {
    return 'Ok';
  }

  @Post('check-code')
  @Public()
  checkCode(@Body() registerDto: CodeAuthDto) {
    return this.authService.checkCode(registerDto);
  }

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService.sendMail({
      to: 'hoa.tmh2003@gmail.com', // list of receivers
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      template: 'register',
      context: {
        name: 'Eric',
        activationCode: 123456789,
      },
    });
    return 'ok';
  }

  @Get('cache/:key')
  @Public()
  async getCache(@Param('key') key: string) {
    const value = await this.authService.getCache(key);
    return value ? { value } : { message: 'Cache not found' };
  }
}
