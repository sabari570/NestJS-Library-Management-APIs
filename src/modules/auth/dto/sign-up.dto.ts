import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "src/modules/users/enums/role-status.enum";

export class signUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsOptional()
    @IsEnum(Role)
    role?: Role
}
