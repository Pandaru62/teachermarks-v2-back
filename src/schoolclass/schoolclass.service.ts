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
    return this.prismaService.schoolclass.findMany(
      {
        where:
          {teachers:
            {some:
              {userId}
            }
          },
        // include: {
        //   _count: {
        //     select: {
        //       students: true
        //     }
        //   }
        // }
      }
    )
  }

  async findOne(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.findUnique({where: {id, teachers: {some: {userId}}}});
  }

  // Promise<Pick<schoolclass, "id" | "color" | "name">
  async findOneWithPupils(id: number, userId: number): Promise<any> {
    const schoolClass = await this.prismaService.schoolclass.findUnique(
      {
        where: {
          id, 
          teachers: {
            some: {userId}
          },
        },
        select: {
          id: true,
          color: true,
          name: true
        }
      }
    );

    const pupils = await this.prismaService.student.findMany({
      where: {
        schoolClasses: {
          some: {
            schoolClassId: schoolClass.id
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    })

    return {
      ...schoolClass,
      pupils
    };
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

   async archive(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.update(
      {
        where: {id, teachers: {some: {userId}}},
        data: {
          isArchived: true
        }
      }
    );
  }
}
