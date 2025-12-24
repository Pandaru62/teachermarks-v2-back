import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTestTagDto } from './dto/create-testtag-dto';
import { UpdateTestTagDto } from './dto/update-testtag-dto';

export type testTagOutput = {
  id: number;
  name: string;
  color: string;
};

const testTagSelect = {
    id: true,
    name: true,
    color: true
}

@Injectable()
export class TestTagService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(userId : number): Promise<testTagOutput[]> {
        return this.prismaService.testTag.findMany({
          where: {
            createdBy: {
                id: userId
            }
          },
          select: testTagSelect
        })
    }

    async getById(id: number): Promise<testTagOutput> {
        return this.prismaService.testTag.findUnique({
            where: {id},
            select: testTagSelect
        })
    }

    async create(data: CreateTestTagDto, userId: number): Promise<testTagOutput> {
        return this.prismaService.testTag.create({
            data: {...data, createdById: userId},
        });
    }

    async update(id: number, data: UpdateTestTagDto):Promise<testTagOutput> {
        return this.prismaService.testTag.update({
            where: {id},
            data: {
                ...data
            }
        })

    }

    async remove(id: number): Promise<testTagOutput> {
        return this.prismaService.testTag.delete({
        where: {id}
        })
    }
  
}
