import { Injectable } from '@nestjs/common';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { UpdateStudentTestDto } from './dto/update-student-test.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StudentTestService {

  constructor(private readonly prismaService: PrismaService) {}

  create(createStudentTestDto: CreateStudentTestDto) {
    return 'This action adds a new studentTest';
  }

  // returns test results by a testId
  async findAllByTestId(testId : number) {

    // !!  check if user id has rights

    return this.prismaService.studenttest.findMany(
      {where:
        {
          testId
        },
        select: {
          id: true,
          mark: true,
          isAbsent: true,
          isUnmarked: true,
          student: {
            select: {
              id: true,
              lastName: true,
              firstName: true,
            }
          },
          studenttesthasskill: {
            select: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true
                }
              },
              level: true
            }
          }
        },
        orderBy:
          [{
            student: {
              lastName: 'asc',
            }
          }, {
            student: {
              firstName: 'asc'
            }
          }
          ],
      }
    )
  }

  findOne(id: number) {
    return `This action returns a #${id} studentTest`;
  }

  update(id: number, updateStudentTestDto: UpdateStudentTestDto) {
    return `This action updates a #${id} studentTest`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentTest`;
  }
}
