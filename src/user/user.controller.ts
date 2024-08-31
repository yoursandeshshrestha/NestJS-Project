import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { MailgunService } from '../auth/mailgun.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailgunService: MailgunService,
  ) {}

  @Get('check')
  async check() {
    return { message: 'test' };
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) {
      return { message: 'Fill in all fields' };
    }
    const user = await this.userService.register(email, password);
    const token = this.jwtService.sign({ email: user.email });
    await this.mailgunService.sendVerificationEmail(user.email, token);
    return {
      message:
        'User registered successfully, please check your email to verify your account.',
    };
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findByEmail(decoded.email);
      if (user) {
        user.isVerified = true;
        await this.userService.updateUser(user);
        return { message: 'Account verified successfully' };
      }
      return { message: 'User not found' };
    } catch (error) {
      return { message: 'Invalid or expired token' };
    }
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { email, password } = body;

    if (!email || !password) {
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = this.jwtService.sign({ email: user.email, sub: user.id });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    return res.json({
      message: 'Login successful',
    });
  }
}
