import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { TrimesterEnum, user } from 'prisma/generated/browser';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

export interface UserWithoutPassword {
    email: string;
    firstname: string;
    id: number;
    lastname: string;
    school: string | null;
    is_first_visit: boolean;
    current_trimester: TrimesterEnum | null;
}

export interface UserForAuth extends Pick<user, 'id' | 'email' | 'password' | 'role' | 'isValidated' | 'isFirstVisit'> {
  teacher: {
    firstname: string;
    lastname: string;
    school: { name: string; currentTrimester: TrimesterEnum } | null;
  } | null;
  student: { firstName: string; lastName: string } | null;
}

@Injectable()
export class UserService {

  constructor(private readonly prismaService : PrismaService){}

  

  async findByEmail(email: string): Promise<UserForAuth | null> {
    return this.prismaService.user.findFirst({
      where: {email},
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isValidated: true,
        isFirstVisit: true,
        teacher: {
          select: {
            firstname: true,
            lastname: true,
            school: {
              select: {
                name: true,
                currentTrimester: true
              }
            }
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  create(data: CreateUserDto): Promise<user> {
    return this.prismaService.user.create({
      data: {
        // TO CHANGE
        login: data.email,
        email: data.email,
        password: data.password,
        role: 'TEACHER',
        isValidated: true,
        isFirstVisit: true,
        teacher: {
          create: {
            firstname: '',
            lastname: ''
          }
        }
      },
    })
  }

  async updateProfile(profile: { firstname: string; lastname: string; school: string }, userId: number): Promise<UserWithoutPassword> {
    const account = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (account?.role === 'STUDENT') {
      const student = await this.prismaService.student.update({
        where: { userId },
        data: {
          firstName: profile.firstname,
          lastName: profile.lastname
        },
        select: {
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
              isFirstVisit: true
            }
          }
        }
      });

      return {
        id: userId,
        email: student.user.email,
        firstname: student.firstName,
        lastname: student.lastName,
        school: null,
        is_first_visit: student.user.isFirstVisit,
        current_trimester: null
      };
    }

    const teacher = await this.prismaService.teacher.update({
      where: { userId },
      data: {
        firstname: profile.firstname,
        lastname: profile.lastname,
        school: {
          upsert: {
            create: { name: profile.school },
            update: { name: profile.school }
          }
        }
      },
      select: {
        firstname: true,
        lastname: true,
        user: {
          select: {
            email: true,
            isFirstVisit: true
          }
        },
        school: {
          select: {
            name: true,
            currentTrimester: true
          }
        }
      }
    });

    return {
      id: userId,
      email: teacher.user.email,
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      school: teacher.school?.name ?? null,
      is_first_visit: teacher.user.isFirstVisit,
      current_trimester: teacher.school?.currentTrimester ?? null
    };
  }

  async updatePreferences(body: UpdatePreferencesDto, userId: number) : Promise<TrimesterEnum> {
    const teacher = await this.prismaService.teacher.findUnique({
      where: { userId },
      select: { schoolId: true }
    });

    if (!teacher?.schoolId) {
      throw new NotFoundException('The user is not associated with a school.');
    }

    const updatedSchool = await this.prismaService.school.update({
      where: { id: teacher.schoolId },
      data: { currentTrimester: body.current_trimester }
    });

    return updatedSchool.currentTrimester;
  }

  async disableIsFirstVisit(userId: number) : Promise<user> {
    return this.prismaService.user.update({
      where: {
        id: userId
      },
      data: {
        isFirstVisit: false
      }
    })
  }

}
