import { Injectable } from '@nestjs/common';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { UpdateStudentTestDto } from './dto/update-student-test.dto';
import { PrismaService } from 'prisma/prisma.service';

const selectReturn = {
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
  };


@Injectable()
export class StudentTestService {


  constructor(private readonly prismaService: PrismaService) {}

  async checkIfExists(studentId :number, testId :number, userId :number) {
    return this.prismaService.studenttest.findUnique({
      where: {
        studentTestId: {
          studentId,
          testId
        },
        student: {
          schoolClasses: {
            some: {
              schoolClass: {
                teachers: {
                  some: {
                    userId
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  create(data: CreateStudentTestDto, studentId: number, testId: number) {
    return this.prismaService.studenttest.create({
      data: {
        mark: data.mark,
        isAbsent: data.isAbsent,
        isUnmarked: data.isUnmarked,
        student: {
          connect: {
            id: studentId
          }
        },
        test: {
          connect: {
            id: testId
          }
        },
        studenttesthasskill: {
          createMany: {
            data: data.skills.map((sk) => (
              {
                level: sk.level,
                skillId: sk.skillId
              }
            ))
          }
        }
      },
      select: selectReturn
    })
  }

  async findAllByStudentId(studentId: number, teacherId: number) {
    return this.prismaService.studenttest.findMany({
      where: {
        studentId,
        student: {
          schoolClasses: {
            some: {
              schoolClass: {
                teachers: {
                  some: {
                    userId: teacherId
                  }
                }
              }
            }
          }
        }
      },
      select:  {
        id: true,
        mark: true,
        isAbsent: true,
        isUnmarked: true,
        test: {
          select: {
            id: true,
            coefficient: true,
            date: true,
            description: true,
            name: true,
            scale: true,
            trimester: true,
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
      orderBy: {
        test : {
          date: 'desc'
        }
      }
    })
  }

  async findAllByTestId(testId : number, teacherId: number) {
    return this.prismaService.studenttest.findMany(
      {where:
        {
          testId,
          student: {
            schoolClasses: {
              some: {
                schoolClass: {
                  teachers: {
                    some: {
                      userId: teacherId
                    }
                  }
                }
              }
            }
          }
        },
        select: selectReturn,
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

  async update(id: number, updatedStudentTest: UpdateStudentTestDto) {

    // 1. Update Skills
    for (const skill of updatedStudentTest.skills) {

      const newInfo = {
        level: skill.level,
        skill: {
          connect: {
            id: skill.skillId
          }
        },
        studenttest: {
          connect: {
            id
          }
        }
      }

      await this.prismaService.studenttesthasskill.upsert(
        {
          where: {
            studentTestSkillId: {
              skillId: skill.skillId,
              studentTestId: id
            }
          },
          update: newInfo,
          create: newInfo,
        }
      )
    }

    // 2. Update StudentTest and return it
    return this.prismaService.studenttest.update({
      where: {
        id: id
      },
      data: {
        isAbsent: updatedStudentTest.isAbsent,
        isUnmarked: updatedStudentTest.isUnmarked,
        mark: updatedStudentTest.mark
      },
      select: selectReturn
    })
  }

  remove(id: number) {
    return `This action removes a #${id} studentTest`;
  }
}
