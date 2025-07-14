import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { profile, user } from '@prisma/client';
import { UserWithProfile } from './entities/user.entity';

export interface UserWithoutPassword {
    email: string;
    firstname: string;
    id: number;
    lastname: string;
    school: string;
    is_first_visit: boolean;
}

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
        is_first_visit: true,
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
        is_validated: true,
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

  async updateProfile(profile : Pick<profile, "firstname" | "lastname" | "school">, userId : number): Promise<UserWithoutPassword> {
    const updatedProfile = await this.prismaService.profile.update({
      where: {
        userId
      },
      data: {
        firstname: profile.firstname,
        lastname: profile.lastname,
        school: profile.school
      },
      select: {
        user: {
          select: {
            is_first_visit: true,
            email: true
          }
        }
      }
    });

    if (updatedProfile) {
      return {
        id: userId,
        email: updatedProfile.user.email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        school: profile.school,
        is_first_visit: updatedProfile.user.is_first_visit
      }
    }
  }

  async disableIsFirstVisit(userId: number) : Promise<user> {
    return this.prismaService.user.update({
      where: {
        id: userId
      },
      data: {
        is_first_visit: false
      }
    })
  }

}
