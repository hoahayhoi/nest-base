import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/guard/local-auth.guard';
import { CodeAuthDto, CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { Public, ResponseMessage } from '@/common/decorator/customize';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GoogleOAuthGuard } from './passport/guard/google-oauth.guard';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return request.user;
  }

  @Public()
  @Post('google')
  async googleLogin(@Body('token') token: string) {
    return this.authService.verifyGoogleToken(token);
  }
}
