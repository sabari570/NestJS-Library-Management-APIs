import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignIn {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
