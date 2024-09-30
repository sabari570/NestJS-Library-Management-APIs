import { Injectable, Scope } from '@nestjs/common';
import UserInterface from './interface/user.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersRepository {
  constructor(private readonly client: PrismaService) { }

  // Here the field is the column name and id is the value
  async recordExist(id?, field = 'id'): Promise<boolean> {
    let query = {};
    if (id) {
      query = {
        where: {
          [field]: id,
        },
      };
    }

    const record = await this.client.user.findFirst({
      ...query,
    });
    return !!record;
  }

  async findByEmail(email: string) {
    return await this.client.user.findFirst({
      where: {
        email,
      },
      include: {
        loans: {
          include: {
            Book: true,
          },
        },
      },
    });
  }

  async findUserById(id: number) {
    return await this.client.user.findUnique({
      where: {
        id,
      },
      include: {
        loans: {
          include: {
            Book: true,
          },
        },
      },
    });
  }

  async create(user: UserInterface) {
    return this.client.user.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: user?.role,
      },
    });
  }


  // repository code to fetch all the users
  async getAll(queryBuilder) {
    return await this.client.user.findMany({
      ...queryBuilder,
      include: {
        loans: {
          include: {
            Book: true,
          }
        }
      }
    })
  }
}
