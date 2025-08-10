import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { profile, TrimesterEnum, user } from '@prisma/client';
import { UserWithProfile } from './entities/user.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

export interface UserWithoutPassword {
    email: string;
    firstname: string;
    id: number;
    lastname: string;
    school: string;
    is_first_visit: boolean;
    current_trimester: TrimesterEnum;
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
        current_trimester: true,
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
        current_trimester: TrimesterEnum.TR1,
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
            email: true,
            current_trimester: true
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
        is_first_visit: updatedProfile.user.is_first_visit,
        current_trimester: updatedProfile.user.current_trimester
      }
    }
  }

  async updatePreferences(body: UpdatePreferencesDto, userId: number) : Promise<TrimesterEnum> {
    const updatedTrimester = await this.prismaService.user.update({
      where: {
        id: userId
      },
      data: {
        current_trimester: body.current_trimester
      }
    })

    return updatedTrimester.current_trimester
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
