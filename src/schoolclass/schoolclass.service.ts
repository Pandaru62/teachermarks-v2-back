import { Injectable } from '@nestjs/common';
import { CreateSchoolclassDto } from './dto/create-schoolclass.dto';
import { UpdateSchoolclassDto } from './dto/update-schoolclass.dto';
import { PrismaService } from 'prisma/prisma.service';
import { schoolclass } from '@prisma/client';

@Injectable()
export class SchoolclassService {

  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateSchoolclassDto, userId: number): Promise<schoolclass> {

    // create the class
    const newClass = await this.prismaService.schoolclass.create(
      {data: {
        color: data.color,
        name: data.name,
        form: {connect: {id: data.formId}}
      }
    })

    // connect the class to the teacher
    if (newClass) await this.prismaService.userHasSchoolClass.create({
      data: {schoolClassId: newClass.id, userId }
    })
    return newClass;
  }

  async findAll(userId : number): Promise<schoolclass[]> {
    return this.prismaService.schoolclass.findMany({where: {teachers: {some: {userId}}}})
  }

  async findOne(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.findUnique({where: {id, teachers: {some: {userId}}}});
  }

  async update(id: number, data: UpdateSchoolclassDto, userId : number): Promise<schoolclass> {
    return this.prismaService.schoolclass.update(
      { 
        where: 
          {
            id,
            teachers: {some: {userId}}
          }, 
        data 
      }
    );
  }

  /* Is the class assigned to other teachers? */
  async countTeachersByClass(schoolClassId: number): Promise<number> {
    return this.prismaService.userHasSchoolClass.count({where: {schoolClassId}})
  }

  async remove(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.delete({where: {id, teachers: {some: {userId}}}});
  }
}
