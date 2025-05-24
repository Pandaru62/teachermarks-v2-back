import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { skill } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SkillService {

    constructor(private readonly prismaService: PrismaService) {}

    async create(data: CreateSkillDto, userId: number):Promise<skill> {
        return this.prismaService.skill.create({ data: 
            { 
                name: data.name,
                description: data.description,
                abbreviation: data.abbreviation,
                userId
            }
        })
    }

    async getAll(): Promise<skill[]> {
        return this.prismaService.skill.findMany({})
    }

    async getAllByUser(userId: number): Promise<skill[]> {
        return this.prismaService.skill.findMany({where: {userId}})
    }

    async getById(id: number): Promise<skill> {
        return this.prismaService.skill.findUnique({
        where: {id}
        })
    }

    async update(id: number, data: UpdateSkillDto, userId: number):Promise<skill> {
        return this.prismaService.skill.update({
            where: {id, userId},
            data
        })
    }

    async remove(id: number, userId: number): Promise<skill> {
            return this.prismaService.skill.delete({
            where: {id, userId}
            })
        }
  
}
