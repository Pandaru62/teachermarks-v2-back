import { Injectable } from '@nestjs/common';
import { student } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(): Promise<student[]> {
        return this.prismaService.student.findMany({})
    }

    async getById(id: number): Promise<student> {
        return this.prismaService.student.findUnique({
        where: {id}
        })
    }

    async create(data: CreateStudentDto):Promise<student> {
        return this.prismaService.student.create(
          {data}
        )
    }

    async update(id: number, data: UpdateStudentDto):Promise<student> {
        return this.prismaService.student.update({
            where: {id},
            data
        })
    }

    async remove(id: number): Promise<student> {
            return this.prismaService.student.delete({
            where: {id}
            })
        }
  
}
