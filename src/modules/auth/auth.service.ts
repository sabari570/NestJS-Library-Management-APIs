import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StringService } from '../../helpers/string.service';
import { SignIn } from './dto/sign-in.dto';
import { User } from '@prisma/client';
import { JwtGeneratorService } from '../../helpers/jwt.generator';
import { Status } from './enums/auth-status.enum';
import * as bcrypt from 'bcrypt';
import { signUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private readonly loggerService: Logger,
    private readonly stringService: StringService,
    private readonly jwtGenerator: JwtGeneratorService,
  ) { }

  async registerUser(createUserDto: signUpDto) {
    return this.userService.create(createUserDto);
  }

  async authenticateUser(user: SignIn) {
    user.email = this.stringService.stringToLowerCase(user.email);
    const retrievedUser = await this.userService.findByEmail(user.email);
    return this.handleOnSuccess(retrievedUser, user);
  }

  async handleOnSuccess(authResponse?: User, userData?: SignIn) {
    try {
      this.loggerService.log(`Auth >  handleOnSuccess(): called`);
      if (!authResponse) {
        this.loggerService.error(
          `Auth > handleOnSuccess(): Error - Their is no such mail registered`,
          ``,
        );
        throw new Error('Sorry no such email is registered');
      }

      const hashedPassword = authResponse.password;
      const isPasswordMatch = await bcrypt.compare(
        userData.password,
        hashedPassword,
      );

      if (!isPasswordMatch) {
        throw new Error('Invalid credentials');
      }
      const jwtPayload = {
        id: authResponse.id,
        name: authResponse.name,
        email: authResponse.email,
      };
      const { accessToken, refreshToken } =
        this.jwtGenerator.generateTokensForUsers(jwtPayload);
      this.loggerService.log(`Auth > handleOnSuccess(): Success`);
      return {
        status: Status.OK,
        accessToken,
        refreshToken,
        userid: jwtPayload.id,
      };
    } catch (error) {
      this.loggerService.error(`Auth > handleOnSuccess(): Error - ${error}`);
      return {
        status: Status.INVALID_CREDENTIALS,
        message: `${error.message}`,
      };
    }
  }

  async signOut() {
    this.loggerService.log(`Auth > signOut(): called`);

    this.loggerService.log(`Auth > signOut(): successfully signed out`);
    return { message: "Successfully signed out" }
  }
}
