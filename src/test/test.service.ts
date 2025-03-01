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

    async create(data: CreateTestDto):Promise<test> {
        return this.prismaService.test.create(
          {
            data: {...data,
              schoolclass: {
                connect: {
                  id: data.schoolClassid
                }
              }
            }
          }
        )
    }

    async update(id: number, data: UpdateTestDto):Promise<test> {
        return this.prismaService.test.update({
            where: {id},
            data
        })
    }

    async remove(id: number): Promise<test> {
            return this.prismaService.test.delete({
            where: {id}
            })
        }
  
}
