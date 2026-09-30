import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { UpdateStudentTestDto } from './dto/update-student-test.dto';
import { BatchUpdateStudentTestDto } from './dto/batch-update-student-test.dto';
import { PrismaService } from 'prisma/prisma.service';
import { LevelEnum } from 'prisma/generated/enums';

const selectReturn = {
  id: true,
  mark: true,
  isAbsent: true,
  isUnmarked: true,
  comment: true,
  student: {
    select: {
      id: true,
      lastName: true,
      firstName: true,
    },
  },
  studenttesthasskill: {
    select: {
      skill: {
        select: {
          id: true,
          name: true,
          abbreviation: true,
        },
      },
      level: true,
    },
  },
};

@Injectable()
export class StudentTestService {
  constructor(private readonly prismaService: PrismaService) {}

  async checkIfExists(studentId: number, testId: number, userId: number) {
    return this.prismaService.studenttest.findUnique({
      where: {
        studentTestId: {
          studentId,
          testId,
        },
        student: {
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
      },
    });
  }

  create(data: CreateStudentTestDto, studentId: number, testId: number) {
    return this.prismaService.studenttest.create({
      data: {
        mark: data.mark,
        isAbsent: data.isAbsent,
        isUnmarked: data.isUnmarked,
        comment: data.comment,
        student: {
          connect: {
            id: studentId,
          },
        },
        test: {
          connect: {
            id: testId,
          },
        },
        studenttesthasskill: {
          createMany: {
            data: data.skills.map((sk) => ({
              level: sk.level,
              skillId: sk.skillId,
            })),
          },
        },
      },
      select: selectReturn,
    });
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
                    teacher: {
                      userId: teacherId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        mark: true,
        isAbsent: true,
        isUnmarked: true,
        comment: true,
        test: {
          select: {
            id: true,
            coefficient: true,
            date: true,
            description: true,
            name: true,
            scale: true,
            trimester: true,
          },
        },
        studenttesthasskill: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
              },
            },
            level: true,
          },
        },
      },
      orderBy: {
        test: {
          date: 'desc',
        },
      },
    });
  }

  async findAllByTestId(testId: number, teacherId: number) {
    return this.prismaService.studenttest.findMany({
      where: {
        testId,
        student: {
          schoolClasses: {
            some: {
              schoolClass: {
                teachers: {
                  some: {
                    teacher: {
                      userId: teacherId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: selectReturn,
      orderBy: [
        {
          student: {
            lastName: 'asc',
          },
        },
        {
          student: {
            firstName: 'asc',
          },
        },
      ],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} studentTest`;
  }

  async update(id: number, updatedStudentTest: UpdateStudentTestDto) {
    const isStudentAbsent = updatedStudentTest.isAbsent;
    const isStudentUnmarked = updatedStudentTest.isUnmarked;

    // 1. Update Skills
    for (const skill of updatedStudentTest.skills) {
      const newInfo = {
        level: isStudentAbsent
          ? LevelEnum.ABS
          : isStudentUnmarked
            ? LevelEnum.NN
            : skill.level,
        skill: {
          connect: {
            id: skill.skillId,
          },
        },
        studenttest: {
          connect: {
            id,
          },
        },
      };

      await this.prismaService.studenttesthasskill.upsert({
        where: {
          studentTestSkillId: {
            skillId: skill.skillId,
            studentTestId: id,
          },
        },
        update: newInfo,
        create: newInfo,
      });
    }

    // 2. Update StudentTest and return it
    return this.prismaService.studenttest.update({
      where: {
        id: id,
      },
      data: {
        isAbsent: updatedStudentTest.isAbsent,
        isUnmarked: updatedStudentTest.isUnmarked,
        mark: updatedStudentTest.mark,
        comment: updatedStudentTest.comment,
      },
      select: selectReturn,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Batch upsert : met à jour (ou crée, pour les élèves qui n'ont encore
  | aucune ligne pour ce test) plusieurs studenttest en une seule
  | transaction, plutôt qu'un appel par élève.
  |--------------------------------------------------------------------------
  */

  async batchUpsert(
    testId: number,
    teacherId: number,
    payload: BatchUpdateStudentTestDto,
  ) {
    const { studentTests } = payload;

    if (studentTests.length === 0) {
      return [];
    }

    // On vérifie que chaque élève appartient bien à une classe du
    // professeur, comme le font déjà checkIfExists / findAllByTestId /
    // findAllByStudentId, pour ne pas laisser passer un id arbitraire.
    const authorizedStudents = await this.prismaService.student.findMany({
      where: {
        id: { in: studentTests.map((st) => st.studentId) },
        schoolClasses: {
          some: {
            schoolClass: {
              teachers: {
                some: {
                  teacher: {
                    userId: teacherId,
                  },
                },
              },
            },
          },
        },
      },
      select: { id: true },
    });

    const authorizedStudentIds = new Set(
      authorizedStudents.map((student) => student.id),
    );

    const unauthorizedEntry = studentTests.find(
      (st) => !authorizedStudentIds.has(st.studentId),
    );

    if (unauthorizedEntry) {
      throw new ForbiddenException(
        `L'élève #${unauthorizedEntry.studentId} n'appartient à aucune de vos classes.`,
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const studentTestIds: number[] = [];

      for (const item of studentTests) {
        const { studentId, mark, isAbsent, isUnmarked, comment, skills } = item;

        // 1. Upsert du studenttest lui-même (certains élèves n'ont
        //    encore aucune ligne pour ce test).
        const studentTest = await tx.studenttest.upsert({
          where: {
            studentTestId: {
              studentId,
              testId,
            },
          },
          create: {
            mark,
            isAbsent,
            isUnmarked,
            comment,
            student: { connect: { id: studentId } },
            test: { connect: { id: testId } },
          },
          update: {
            mark,
            isAbsent,
            isUnmarked,
            comment,
          },
        });

        // 2. Upsert de chaque compétence, avec la même règle que
        //    update() : absent/non noté écrase le niveau saisi.
        for (const skill of skills) {
          const level = isAbsent
            ? LevelEnum.ABS
            : isUnmarked
              ? LevelEnum.NN
              : skill.level;

          const skillInfo = {
            level,
            skill: { connect: { id: skill.skillId } },
            studenttest: { connect: { id: studentTest.id } },
          };

          await tx.studenttesthasskill.upsert({
            where: {
              studentTestSkillId: {
                skillId: skill.skillId,
                studentTestId: studentTest.id,
              },
            },
            update: skillInfo,
            create: skillInfo,
          });
        }

        studentTestIds.push(studentTest.id);
      }

      // On renvoie les lignes à jour, dans le même format que
      // findAllByTestId, pour que le front puisse simplement
      // remplacer les entrées modifiées dans son cache.
      return tx.studenttest.findMany({
        where: { id: { in: studentTestIds } },
        select: selectReturn,
      });
    });
  }

  remove(id: number) {
    return `This action removes a #${id} studentTest`;
  }
}
