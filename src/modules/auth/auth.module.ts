import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { StringService } from '../../helpers/string.service';
import { JwtGeneratorService } from '../../helpers/jwt.generator';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UsersModule],
  providers: [
    AuthService,
    JwtStrategy,
    Logger,
    StringService,
    JwtGeneratorService,
    JwtService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
