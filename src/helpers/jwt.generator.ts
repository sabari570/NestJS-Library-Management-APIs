import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGeneratorService {
  constructor(private readonly jwtService: JwtService) { }
  generateTokensForUsers(
    payload: any,
    accessTokenExpiresIn: string = '1d',
    refrehTokenExpiresIn: string = '7d',
  ) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: refrehTokenExpiresIn,
    });
    return { accessToken, refreshToken };
  }
}
