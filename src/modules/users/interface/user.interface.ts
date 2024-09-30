import { Role } from '../enums/role-status.enum';

export default interface UserInterface {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
