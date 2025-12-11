import { Injectable } from '@nestjs/common';
import { test, TrimesterEnum } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

export type TestWithClassAndSkills = {
  id: number;
  name: string;
  description: string;
  coefficient: number;
  date: Date;
  scale: number;
  schoolClassId: number;
  trimester: TrimesterEnum;
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

    async getAll(userId : number): Promise<test[]> {
        return this.prismaService.test.findMany({
          where: {
            schoolclass: {
              teachers: {
                every: {
                  userId
                }
              }
            }
          },
          include: {
            schoolclass: {
              select: {
                name: true,
                color: true
              }
            },
            skills: {
              select: {
                skill: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        })
    }

    async getById(id: number): Promise<TestWithClassAndSkills> {
      const test = await this.prismaService.test.findUnique({
        where: {id},
        include: {
          schoolclass: {
            select: {
              name: true,
              color: true,
              _count: {
                select: {
                  students: true
                }
              }
            },
          },
          skills: {
            select: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true
                }
              }
            }
          }
        }
      })

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
            count: test.schoolclass._count.students
          },
          skills: test.skills.map((sk) => ({
            id: sk.skill.id,
            name: sk.skill.name,
            abbreviation: sk.skill.abbreviation
          }))
        }
    }

async create(data: CreateTestDto): Promise<test & { skills: { id: number; name: string }[] }> {

  const [newTest] = await this.prismaService.$transaction([
    // 1. Create the test
      this.prismaService.test.create({
        data: {
          name: data.name,
          description: data.description,
          coefficient: data.coefficient,
          date: new Date(data.date),
          scale: data.scale,
          trimester: data.trimester,
          schoolclass: {
            connect: {
              id: data.schoolClassId,
            },
          },
        },
      }),
    ]);

  // 2. Connect skills (correctly, since we now know the test ID)
  for (const skill of data.skills) {
    await this.prismaService.testhasskill.createMany({
      data: {
        testId: newTest.id,
        skillId: skill.id
      },
    });
  }

  // 3. Retrieve skills (id + name)
  const testSkills = await this.prismaService.testhasskill.findMany({
    where: { testId: newTest.id },
    select: {
      skill: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 4. Return full result
  return {
    ...newTest,
    skills: testSkills.map((ts) => ({
      id: ts.skill.id,
      name: ts.skill.name,
    })),
  };
}


  async update(id: number, data: UpdateTestDto):Promise<TestWithClassAndSkills> {
    await this.prismaService.test.update({
      where: {id},
      data: {
        name: data.name,
        description: data.description,
        coefficient: data.coefficient,
        date : new Date(data.date),
        scale : data.scale,
        trimester: data.trimester
      },
      include: {

      }
    })

    const updatedSkillIds = data.skills.map((sk) => sk.id)

    // Get current skill ids linked to the test
    const currentSkills = await this.prismaService.testhasskill.findMany(
      {
        where: {testId: id},
        select: { skillId: true }
      });

    const currentSkillIds = currentSkills.map((sk) => sk.skillId);

    // Calculate skills to add and delete
    const skillsToAdd = updatedSkillIds.filter((id) => !currentSkillIds.includes(id));
    const skillsToDelete = currentSkillIds.filter((id) => !updatedSkillIds.includes(id));

    // Delete removed skills
    await this.prismaService.testhasskill.deleteMany({
      where: {
        testId: id,
        skillId: { in: skillsToDelete }
      }
    });

    // Delete associated testskills
    await this.prismaService.studenttesthasskill.deleteMany({
      where: {
        studenttest: {
          testId: id
        },
        skillId: { in: skillsToDelete }
      }
    });

    // Add new skills
    for(const skillId of skillsToAdd) {
      await this.prismaService.testhasskill.create({
        data: {
          test: { connect: { id }},
          skill: {connect: { id: skillId }}
        }
      });
    }

    // Return the updated test with skill
    return this.getById(id);
  }

  async remove(id: number): Promise<test> {
      return this.prismaService.test.delete({
      where: {id}
      })
  }
  
}
