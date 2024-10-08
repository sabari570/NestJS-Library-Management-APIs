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
            book: true,
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
            book: true,
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


  // code to count the total records
  async count(): Promise<number> {
    return await this.client.user.count();
  }

  // Code to count the total records after applying filter
  async countWithFilters(where): Promise<number> {
    const { _count } = await this.client.user.aggregate({
      // counts all the records, if where is provided then it counts all the records that satisfies this condition
      _count: true,
      where,
    });
    return Number(_count);
  }

  // Code to get the total pages count
  async getTotalPagesCount(count: number, take: number) {
    return Math.ceil(count / take);
  }

  // Code to update the user details
  async update(id: number, user: UserInterface) {
    return this.client.user.update({
      where: {
        id
      },
      data: {
        email: user.email,
        name: user.name,
      }
    });
  }

  // Code to delete the user details
  async delete(id: number) {
    return this.client.user.delete({
      where: {
        id
      }
    })
  }
}
