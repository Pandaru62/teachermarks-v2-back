import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { user } from '@prisma/client';
import { UserWithProfile } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(private readonly prismaService : PrismaService){}

  async findByEmail(email: string): Promise<Partial<UserWithProfile>> {
    return this.prismaService.user.findUnique({
      where: {email},
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        is_validated: true,
        profile: {
          select: {
            firstname: true,
            lastname: true,
            school: true
          }
        }
      }
    })
  }

  create(data: CreateUserDto): Promise<user> {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: 'TEACHER',
        profile: {
          create: {
            firstname: "",
            lastname: "",
            school: ""
          }
        }
      },
    })
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
