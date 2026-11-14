import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { Decimal } from 'prisma/generated/internal/prismaNamespace';
import { TrimesterEnum } from 'prisma/generated/enums';
import { test } from 'prisma/generated/browser';

export type TestWithClassAndSkills = {
  id: number;
  name: string;
  description: string;
  coefficient: Decimal;
  date: Date;
  scale: number;
  schoolClassId: number;
  trimester: TrimesterEnum;
  testTag?: {
    id: number;
    name: string;
    color: string;
  };
  schoolclass: {
    name: string;
    count: number;
    color: string;
  };
  skills: {
    id: number;
    name: string;
    abbreviation: string;
  }[];
};

@Injectable()
export class TestService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(userId: number): Promise<test[]> {
    return this.prismaService.test.findMany({
      where: {
        schoolclass: {
          teachers: {
            every: {
              teacher: {
                userId,
              },
            },
          },
        },
      },
      include: {
        schoolclass: {
          select: {
            name: true,
            color: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        testTag: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getByClassId(userId: number, classId: number): Promise<test[]> {
    return this.prismaService.test.findMany({
      where: {
        schoolclass: {
          teachers: {
            every: {
              teacher: {
                userId,
              },
            },
          },
        },
        schoolClassId: {
          equals: classId,
        },
      },
      include: {
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        testTag: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getById(id: number): Promise<TestWithClassAndSkills> {
    const test = await this.prismaService.test.findUnique({
      where: { id },
      include: {
        schoolclass: {
          select: {
            name: true,
            color: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
              },
            },
          },
        },
        testTag: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return {
      id: test.id,
      name: test.name,
      description: test.description,
      coefficient: test.coefficient,
      date: test.date,
      scale: test.scale,
      schoolClassId: test.schoolClassId,
      trimester: test.trimester,
      schoolclass: {
        name: test.schoolclass.name,
        color: test.schoolclass.color,
        count: test.schoolclass._count.students,
      },
      skills: test.skills.map((sk) => ({
        id: sk.skill.id,
        name: sk.skill.name,
        abbreviation: sk.skill.abbreviation,
      })),
      testTag: test.testTag,
    };
  }

  async create(
    data: CreateTestDto,
  ): Promise<(test & { skills: { id: number; name: string }[] })[]> {
    return this.prismaService.$transaction(async (transaction) => {
      const createdTests = await Promise.all(
        data.schoolClassIds.map((schoolClassId) =>
          transaction.test.create({
            data: {
              name: data.name,
              description: data.description,
              coefficient: data.coefficient,
              date: new Date(data.date),
              scale: data.scale,
              trimester: data.trimester,
              schoolClassId,
              testTagId: data.testTagId,
            },
          }),
        ),
      );

      if (data.skills.length > 0) {
        await Promise.all(
          createdTests.map((createdTest) =>
            transaction.testhasskill.createMany({
              data: data.skills.map((skill) => ({
                testId: createdTest.id,
                skillId: skill.id,
              })),
            }),
          ),
        );
      }

      const skills = data.skills.map(({ id, name }) => ({ id, name }));
      return createdTests.map((createdTest) => ({
        ...createdTest,
        skills,
      }));
    });
  }

  async update(
    id: number,
    data: UpdateTestDto,
  ): Promise<TestWithClassAndSkills> {
    await this.prismaService.test.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        coefficient: data.coefficient,
        date: new Date(data.date),
        scale: data.scale,
        trimester: data.trimester,
        testTagId: data.testTagId,
      },
    });

    const updatedSkillIds = data.skills.map((sk) => sk.id);

    // Get current skill ids linked to the test
    const currentSkills = await this.prismaService.testhasskill.findMany({
      where: { testId: id },
      select: { skillId: true },
    });

    const currentSkillIds = currentSkills.map((sk) => sk.skillId);

    // Calculate skills to add and delete
    const skillsToAdd = updatedSkillIds.filter(
      (id) => !currentSkillIds.includes(id),
    );
    const skillsToDelete = currentSkillIds.filter(
      (id) => !updatedSkillIds.includes(id),
    );

    // Delete removed skills
    await this.prismaService.testhasskill.deleteMany({
      where: {
        testId: id,
        skillId: { in: skillsToDelete },
      },
    });

    // Delete associated testskills
    await this.prismaService.studenttesthasskill.deleteMany({
      where: {
        studenttest: {
          testId: id,
        },
        skillId: { in: skillsToDelete },
      },
    });

    // Add new skills
    for (const skillId of skillsToAdd) {
      await this.prismaService.testhasskill.create({
        data: {
          test: { connect: { id } },
          skill: { connect: { id: skillId } },
        },
      });
    }

    // Return the updated test with skill
    return this.getById(id);
  }

  async duplicate(testId: number, classIds: number[]): Promise<test[]> {
    const originalTest = await this.prismaService.test.findUnique({
      where: { id: testId },
      include: {
        skills: true,
      },
    });

    if (!originalTest) {
      throw new Error(`Test with ID ${testId} not found`);
    }

    const createdTests: test[] = [];

    for (const classId of classIds) {
      const classExists = await this.prismaService.schoolclass.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        throw new Error(`Class with ID ${classId} not found`);
      }

      const duplicatedTest = await this.prismaService.test.create({
        data: {
          name: originalTest.name,
          description: originalTest.description,
          coefficient: originalTest.coefficient,
          date: originalTest.date,
          scale: originalTest.scale,
          trimester: originalTest.trimester,
          schoolClassId: classId,
          testTagId: originalTest.testTagId,
        },
      });

      const skillConnections = originalTest.skills.map((skill) => ({
        testId: duplicatedTest.id,
        skillId: skill.skillId,
      }));

      await this.prismaService.testhasskill.createMany({
        data: skillConnections,
      });

      createdTests.push(duplicatedTest);
    }

    return createdTests;
  }

  async remove(id: number): Promise<test> {
    return this.prismaService.test.delete({
      where: { id },
    });
  }
}
