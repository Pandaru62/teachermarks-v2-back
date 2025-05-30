import { Injectable } from '@nestjs/common';
import { test } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class TestService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(): Promise<test[]> {
        return this.prismaService.test.findMany({})
    }

    async getById(id: number): Promise<test> {
        return this.prismaService.test.findUnique({
        where: {id}
        })
    }

async create(data: CreateTestDto): Promise<test & { skills: { id: number; name: string }[] }> {
  // Pre-validate skills to ensure they all exist
  const validSkills = await this.prismaService.skill.findMany({
    where: { id: { in: data.skills } },
  });

  if (validSkills.length !== data.skills.length) {
    throw new Error("One or more selected skills do not exist.");
  }

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
  for (const skillId of data.skills) {
    await this.prismaService.testhasskill.createMany({
      data: {
        testId: newTest.id,
        skillId: skillId
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


    async update(id: number, data: UpdateTestDto):Promise<test> {
      return this.prismaService.test.update({
          where: {id},
          data: {
            name: data.name,
            description: data.description,
            coefficient: data.coefficient,
            date : data.date,
            scale : data.scale,
            trimester: data.trimester
          }
      })
    }

    async remove(id: number): Promise<test> {
            return this.prismaService.test.delete({
            where: {id}
            })
        }
  
}
