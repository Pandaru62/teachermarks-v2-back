import { Injectable } from '@nestjs/common';
import { CreateSchoolclassDto } from './dto/create-schoolclass.dto';
import { UpdateSchoolclassDto } from './dto/update-schoolclass.dto';
import { PrismaService } from 'prisma/prisma.service';
import { schoolclass } from '@prisma/client';

@Injectable()
export class SchoolclassService {

  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateSchoolclassDto): Promise<schoolclass> {
    return this.prismaService.schoolclass.create({
      data: {...data},
    })
  }

  async findAll(): Promise<schoolclass[]> {
    return this.prismaService.schoolclass.findMany()
  }

  async findOne(id: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.findUnique({where: {id}});
  }

  async update(id: number, data: UpdateSchoolclassDto): Promise<schoolclass> {
    return this.prismaService.schoolclass.update(
      { where: {id}, data }
    );
  }

  async remove(id: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.delete({where: {id}});
  }
}
