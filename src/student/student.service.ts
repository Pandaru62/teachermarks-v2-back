import { HttpStatus, Injectable } from '@nestjs/common';
import { student, TrimesterEnum } from 'prisma/generated/browser';
import { PrismaService } from 'prisma/prisma.service';
import { CreateManyStudentsDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { AppException } from 'src/common/exceptions/app.exception';
import { handlePrismaError } from 'src/common/exceptions/prsima-exception';

@Injectable()
export class StudentService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAll(userId: number): Promise<student[]> {
    return this.prismaService.student.findMany({
      where: {
        schoolClasses: {
          some: {
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async getStudentsByClass(
    schoolClassId: number,
    userId: number,
  ): Promise<any> {
    return this.prismaService.student.findMany({
      where: {
        schoolClasses: {
          some: {
            schoolClassId,
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        firstName: true,
        id: true,
        lastName: true,
        schoolClasses: {
          select: {
            schoolClass: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async getById(
    id: number,
    userId: number,
  ): Promise<{
    id: number;
    firstName: string;
    lastName: string;
    classes: { name: string; id: number }[];
  }> {
    const studentWithClass = await this.prismaService.student.findUnique({
      where: {
        id,
        schoolClasses: {
          some: {
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        schoolClasses: {
          select: {
            schoolClass: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!studentWithClass) {
      throw new AppException(
        ErrorCode.STUDENT_NOT_FOUND,
        'Student not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      id: studentWithClass.id,
      firstName: studentWithClass.firstName,
      lastName: studentWithClass.lastName,
      classes: studentWithClass.schoolClasses.map((entry) => ({
        name: entry.schoolClass.name,
        id: entry.schoolClass.id,
      })),
    };
  }

  // async create(data: CreateStudentDto): Promise<student> {
  //   const newStudent = await this.prismaService.student.create({
  //     data: {
  //       firstName: data.firstName,
  //       lastName: data.lastName,
  //     },
  //   });

  //   try {
  //     await Promise.all(
  //       data.schoolClassId.map(async (nb) => {
  //         await this.prismaService.studentHasSchoolClass.create({
  //           data: {
  //             schoolClassId: nb,
  //             studentId: newStudent.id,
  //           },
  //         });
  //       }),
  //     );
  //     return newStudent;
  // } catch (error: unknown) {
  //   handlePrismaError(error);
  // }
  // }

  async createMany(
    data: CreateManyStudentsDto[],
    userId: number,
  ): Promise<student[]> {
    if (data.length === 0) return [];

    // Check if the user is a teacher of all the classes
    const classes = await this.prismaService.schoolclass.findMany({
      where: {
        id: { in: data.map((student) => student.schoolClassId) },
        teachers: {
          some: {
            teacher: {
              userId,
            },
          },
        },
      },
    });

    if (classes.length !== data.length) {
      throw new AppException(
        ErrorCode.FORBIDDEN,
        'You are not a teacher of all the classes',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      return await this.prismaService.$transaction(async (tx) => {
        // 1. Create students
        const newStudents = await Promise.all(
          data.map((student) =>
            tx.student.create({
              data: {
                firstName: student.firstName,
                lastName: student.lastName,
              },
            }),
          ),
        );

        // 2. Link each student to their school class
        await Promise.all(
          newStudents.map((student, index) =>
            tx.studentHasSchoolClass.create({
              data: {
                schoolClassId: data[index].schoolClassId,
                studentId: student.id,
              },
            }),
          ),
        );

        // 3. Create reports for each trimester
        const trimesters = [
          TrimesterEnum.TR1,
          TrimesterEnum.TR2,
          TrimesterEnum.TR3,
        ];

        await Promise.all(
          newStudents.flatMap((student) =>
            trimesters.map((trimester) =>
              tx.report.create({
                data: {
                  description: '',
                  trimester,
                  studentId: student.id,
                },
              }),
            ),
          ),
        );

        return newStudents;
      });
    } catch (error: unknown) {
      handlePrismaError(error);
    }
  }

  async update(
    id: number,
    data: UpdateStudentDto,
    userId: number,
  ): Promise<{
    id: number;
    firstName: string;
    lastName: string;
    classes: { name: string; id: number }[];
  }> {
    const updatedStudent = await this.prismaService.student.update({
      where: {
        id,
        schoolClasses: {
          some: {
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      data,
    });

    if (updatedStudent) {
      return this.getById(id, userId);
    }
  }

  async remove(id: number, userId: number): Promise<student> {
    return this.prismaService.student.delete({
      where: {
        id,
        schoolClasses: {
          some: {
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
