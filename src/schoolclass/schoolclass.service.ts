import { Injectable } from '@nestjs/common';
import { CreateSchoolclassDto } from './dto/create-schoolclass.dto';
import { UpdateSchoolclassDto } from './dto/update-schoolclass.dto';
import { PrismaService } from 'prisma/prisma.service';
import {
  schoolclass,
  SchoolYearEnum,
  TrimesterEnum,
} from 'prisma/generated/browser';

@Injectable()
export class SchoolclassService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: CreateSchoolclassDto,
    userId: number,
  ): Promise<schoolclass> {
    // create the class
    const newClass = await this.prismaService.schoolclass.create({
      data: {
        color: data.color,
        name: data.name,
        // TO CHANGE
        schoolYear: SchoolYearEnum.Y2026_2027,
        form: { connect: { id: data.formId } },
      },
    });

    // connect the class to the teacher
    if (newClass)
      await this.prismaService.teacherHasSchoolClass.create({
        data: { schoolClassId: newClass.id, teacherId: userId },
      });
    return newClass;
  }

  async findAll(userId: number) {
    return this.prismaService.schoolclass.findMany({
      where: {
        teachers: {
          some: {
            teacherId: userId,
          },
        },
        isArchived: false,
      },
      select: {
        id: true,
        color: true,
        name: true,
        _count: {
          select: {
            students: true,
            test: true,
          },
        },
      },
    });
  }

  async findOne(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.findUnique({
      where: { id, teachers: { some: { teacherId: userId } } },
    });
  }

  async findOneWithPupils(id: number, userId: number): Promise<any> {
    const schoolClass = await this.prismaService.schoolclass.findUnique({
      where: {
        id,
        teachers: {
          some: { teacherId: userId },
        },
      },
      select: {
        id: true,
        color: true,
        name: true,
      },
    });

    const pupils = await this.prismaService.student.findMany({
      where: {
        schoolClasses: {
          some: {
            schoolClassId: schoolClass.id,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return {
      ...schoolClass,
      pupils,
    };
  }

  async findOneWithPupilsAndAverage(id: number, userId: number): Promise<any> {
    const schoolClass = await this.prismaService.schoolclass.findUnique({
      where: {
        id,
        teachers: {
          some: { teacherId: userId },
        },
      },
      select: {
        id: true,
        color: true,
        name: true,
      },
    });

    const pupils = await this.prismaService.student.findMany({
      where: {
        schoolClasses: {
          some: {
            schoolClassId: schoolClass.id,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studenttest: {
          select: {
            mark: true,
            isAbsent: true,
            isUnmarked: true,
            test: {
              select: {
                coefficient: true,
                scale: true,
                trimester: true,
              },
            },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    const pupilsWithAverage = pupils.map((pupil) => {
      const getTrimesterAverage = (trimester: TrimesterEnum) => {
        const validTests = pupil.studenttest.filter(
          (st) =>
            st.test.trimester === trimester && !st.isAbsent && !st.isUnmarked,
        );

        const totalScale = validTests.reduce(
          (acc, st) => acc + Number(st.test.coefficient) * st.test.scale,
          0,
        );

        if (totalScale <= 0) return null;

        const weightedMarks = validTests.reduce(
          (acc, st) => acc + Number(st.mark) * Number(st.test.coefficient),
          0,
        );

        return (weightedMarks / totalScale) * 20;
      };

      const trimesterAverages = {
        TR1: getTrimesterAverage(TrimesterEnum.TR1),
        TR2: getTrimesterAverage(TrimesterEnum.TR2),
        TR3: getTrimesterAverage(TrimesterEnum.TR3),
      };
      const availableAverages = Object.values(trimesterAverages).filter(
        (average): average is number => average !== null,
      );
      const annual =
        availableAverages.length > 0
          ? availableAverages.reduce((sum, average) => sum + average, 0) /
            availableAverages.length
          : null;

      return {
        id: pupil.id,
        firstName: pupil.firstName,
        lastName: pupil.lastName,
        results: {
          ...trimesterAverages,
          annual,
        },
      };
    });

    return {
      ...schoolClass,
      pupils: pupilsWithAverage,
    };
  }

  async update(
    id: number,
    data: UpdateSchoolclassDto,
    userId: number,
  ): Promise<schoolclass> {
    return this.prismaService.schoolclass.update({
      where: {
        id,
        teachers: { some: { teacherId: userId } },
      },
      data,
    });
  }

  /* Is the class assigned to other teachers? */
  async countTeachersByClass(schoolClassId: number): Promise<number> {
    return this.prismaService.teacherHasSchoolClass.count({
      where: { schoolClassId },
    });
  }

  async remove(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.delete({
      where: { id, teachers: { some: { teacherId: userId } } },
    });
  }

  async archive(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.update({
      where: { id, teachers: { some: { teacherId: userId } } },
      data: {
        isArchived: true,
      },
    });
  }

  async unArchive(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.update({
      where: { id, teachers: { some: { teacherId: userId } } },
      data: {
        isArchived: false,
      },
    });
  }
}
