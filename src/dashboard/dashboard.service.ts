import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Dashboard } from './entities/dashboard.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboardData(userId: number): Promise<Dashboard> {
    const lastTestsFound = await this.prismaService.test.findMany({
      where: {
        schoolclass: {
          teachers: {
            some: {
              teacherId: userId,
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 3,
      select: {
        id: true,
        name: true,
        date: true,
        schoolclass: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
      },
    });

    // return number of studenttests found for each testId

    const testIds = lastTestsFound.map((test) => test.id);

    // 1. Complétion : nombre de studenttest notés (mark non-null) par test
    const completionStats = await this.prismaService.studenttest.groupBy({
      by: ['testId'],
      where: {
        testId: {
          in: testIds,
        },
      },
      _count: {
        mark: true,
      },
    });

    // 2. Absences : nombre de studenttest avec isAbsent = true par test.
    // C'est un groupBy à part, filtré par isAbsent, car _count ne peut pas
    // appliquer de condition sur la valeur d'un champ : il ne fait que
    // compter les valeurs non-nulles.
    const absentStats = await this.prismaService.studenttest.groupBy({
      by: ['testId'],
      where: {
        testId: {
          in: testIds,
        },
        isAbsent: true,
      },
      _count: {
        _all: true,
      },
    });

    // Compare numbers and create a percentage
    const lastTestsResult = lastTestsFound.map((test) => {
      const completion = completionStats.find(
        (stat) => stat.testId === test.id,
      );
      const absent = absentStats.find((stat) => stat.testId === test.id);

      const completed = completion?._count.mark ?? 0;
      const absents = absent?._count._all ?? 0;
      const totalStudents = test.schoolclass._count.students;

      return {
        id: test.id,
        name: test.name,
        date: test.date,
        schoolclass: {
          id: test.schoolclass.id,
          name: test.schoolclass.name,
        },
        completion:
          totalStudents === 0
            ? 0
            : Math.round((completed / totalStudents) * 100),
        absents,
      };
    });

    const schoolClasses = await this.prismaService.schoolclass.findMany({
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
    console.log(
      '🚀 ~ DashboardService ~ getDashboardData ~ schoolClasses:',
      schoolClasses,
    );

    return {
      lastTests: lastTestsResult,
      schoolClasses,
    };
  }
}
