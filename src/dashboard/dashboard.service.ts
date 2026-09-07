import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Dashboard } from './entities/dashboard.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboardData(userId : number): Promise<Dashboard> {

    const lastTestsFound = await this.prismaService.test.findMany({
      where: {
        schoolclass: {
          teachers: {
            some: {
              userId
            }
          }
        }
      },
      orderBy: {
        date: "desc"
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
                students: true
              }
            }
          },
        },
      }
    })

    // return number of studenttests found for each testId

    const testIds = lastTestsFound.map(test => test.id);

    const testsStatsV2 = await this.prismaService.studenttest.groupBy({
      by: ['testId'],
      where: {
        testId: {
          in: testIds
        }
      },
      _count: {
        mark: true
      }
    }
    )

    // Compare numbers and create a percentage
    const result = lastTestsFound.map(test => {
      const stats = testsStatsV2.find(stat => stat.testId === test.id);
      const completed = stats?._count.mark ?? 0;
      const totalStudents = test.schoolclass._count.students;

      return {
        id: test.id,
        name: test.name,
        date: test.date,
        schoolclass: {
          id: test.schoolclass.id,
          name: test.schoolclass.name,
        },
        completion: totalStudents === 0
          ? 0
          : Math.round((completed / totalStudents) * 100),
      };
    });

    return {
      lastTests: result
    }
    ;
  }
  
}