import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "../enums/role-status.enum";

export class CreateUserDto {
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
