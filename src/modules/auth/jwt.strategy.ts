import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private userService: UsersService;
  constructor(
    private readonly jwtService: JwtService,
    private moduleRef: ModuleRef,
  ) {
    super({
      jwtFromRequest: (req: any) => {
        if (!req || !req.cookies) {
          return req.cookies['accessToken'];
        }
      },
      secretOrKey: process.env.JWT_SECRET || 'BgsTGUa70YNrhjvzBgsTGUa70YNrhjvz',
      passReqToCallback: true,
    });
  }

  public async validate(request, payload: any) {
    const accessToken = request.cookies['accessToken'];
    let decodedPayload: any;
    try {
      decodedPayload = this.jwtService.verify(accessToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const { userId } = decodedPayload;
    if (!userId) {
      throw new UnauthorizedException('Invalid token!!');
    }

    const contextId = ContextIdFactory.getByRequest(request);
    this.userService = await this.moduleRef.resolve(UsersService, contextId, {
      strict: false,
    });

    await this.userService.setCurrentUser(userId);

    return !!payload.userId;
  }
}
