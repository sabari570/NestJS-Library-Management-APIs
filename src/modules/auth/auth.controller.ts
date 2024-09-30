import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignIn } from './dto/sign-in.dto';
import { Status } from './enums/auth-status.enum';
import { signUpDto } from './dto/sign-up.dto';
import { Response } from 'express';
import { AccessTokenAuthGuard } from './token-auth.guard';
import { Request } from 'supertest';
import { PolciesGuard } from '../guards/policies-guard/policies.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: Logger,
  ) { }

  readonly ONE_DAY = 86400000; // Represents one day in milliseconds

  @Post("sign-up")
  @HttpCode(200)
  async signUp(
    @Body() body: signUpDto,
    @Res() response: Response
  ) {
    this.loggerService.log(`Auth > signUp(): called`);
    const { statusCode, data } = await this.authService.registerUser(body);
    return response.status(statusCode).send(data)
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(
    @Res({ passthrough: true }) response,
    @Body() authenticateRequest: SignIn,
  ) {
    try {
      this.loggerService.log(`Auth > signIn(): called`);
      const authResponse =
        await this.authService.authenticateUser(authenticateRequest);
      if (authResponse.status === Status.INVALID_CREDENTIALS) {
        throw new Error(authResponse.message);
      }

      const secure = process.env.env === 'development' ? false : true;

      response.cookie('accessToken', authResponse.accessToken, {
        httpOnly: true,
        secure,
        maxAge: this.ONE_DAY,
        sameSite: 'Lax',
      });
      response.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure,
        maxAge: this.ONE_DAY,
        sameSite: 'Lax',
      });
      response.cookie('userId', authResponse.userid, {
        secure,
        maxAge: this.ONE_DAY,
        sameSite: 'lax',
      });

      this.loggerService.log(`Auth > signIn(): success`);

      return {
        status: Status.OK,
      };
    } catch (error) {
      this.loggerService.error(`Auth > signIn(): ${error}`);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [`${error.message}`],
        error: 'Bad Request',
      });
    }
  }

  @Post("sign-out")
  @UseGuards(AccessTokenAuthGuard)
  @HttpCode(200)
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) response
  ) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    response.clearCookie('userId');
    const result = await this.authService.signOut()
    return {
      message: result.message,
    }
  }
}
