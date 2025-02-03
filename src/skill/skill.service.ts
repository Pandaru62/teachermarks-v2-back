import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { skill } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SkillService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(): Promise<skill[]> {
        return this.prismaService.skill.findMany({})
    }

    async getById(id: number): Promise<skill> {
        return this.prismaService.skill.findUnique({
        where: {id}
        })
    }

    async create(data: CreateSkillDto):Promise<skill> {
        return this.prismaService.skill.create(
          {data}
        )
    }

    async update(id: number, data: UpdateSkillDto):Promise<skill> {
        return this.prismaService.skill.update({
            where: {id},
            data
        })
    }

    async remove(id: number): Promise<skill> {
            return this.prismaService.skill.delete({
            where: {id}
            })
        }
  
}
