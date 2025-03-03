import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { user } from '@prisma/client';

@Injectable()
export class UserService {

  constructor(private readonly prismaService : PrismaService){}

  async findByEmail(email: string): Promise<Partial<user>> {
    return this.prismaService.user.findUnique({
      where: {email},
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        is_validated: true
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
            firstname: data.firstname,
            lastname: data.lastname,
            school: data.school
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
