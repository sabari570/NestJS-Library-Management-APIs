import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
    // This makes the updateUserDto to not update(exclude) the password and role
    OmitType(CreateUserDto, ['password', 'role'] as const)
) { }
