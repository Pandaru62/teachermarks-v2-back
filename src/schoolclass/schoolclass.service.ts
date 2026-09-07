import { Injectable } from '@nestjs/common';
import { CreateSchoolclassDto } from './dto/create-schoolclass.dto';
import { UpdateSchoolclassDto } from './dto/update-schoolclass.dto';
import { PrismaService } from 'prisma/prisma.service';
import { schoolclass, SchoolYearEnum } from 'prisma/generated/browser';

@Injectable()
export class SchoolclassService {

  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateSchoolclassDto, userId: number): Promise<schoolclass> {

    // create the class
    const newClass = await this.prismaService.schoolclass.create(
      {data: {
        color: data.color,
        name: data.name,
        // TO CHANGE
        schoolYear: SchoolYearEnum.Y2026_2027,
        form: {connect: {id: data.formId}}
      }
    })

    // connect the class to the teacher
    if (newClass) await this.prismaService.teacherHasSchoolClass.create({
      data: {schoolClassId: newClass.id, teacherId: userId }
    })
    return newClass;
  }

  async findAll(userId : number): Promise<schoolclass[]> {
    return this.prismaService.schoolclass.findMany(
      {
        where:
          {
            teachers:
              {some:
                {teacherId: userId}
              },
          }
      }
    )
  }

  async findOne(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.findUnique({where: {id, teachers: {some: {teacherId: userId}}}});
  }

  // Promise<Pick<schoolclass, "id" | "color" | "name">
  async findOneWithPupils(id: number, userId: number): Promise<any> {
    const schoolClass = await this.prismaService.schoolclass.findUnique(
      {
        where: {
          id, 
          teachers: {
            some: {teacherId: userId}
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
      },
      orderBy: {
        lastName: 'asc'
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
            teachers: {some: {teacherId: userId}}
          }, 
        data 
      }
    );
  }

  /* Is the class assigned to other teachers? */
  async countTeachersByClass(schoolClassId: number): Promise<number> {
    return this.prismaService.teacherHasSchoolClass.count({where: {schoolClassId}})
  }

  async remove(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.delete({where: {id, teachers: {some: {teacherId: userId}}}});
  }

  async archive(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.update(
      {
        where: {id, teachers: {some: {teacherId: userId}}},
        data: {
          isArchived: true
        }
      }
    );
  }

  async unArchive(id: number, userId: number): Promise<schoolclass> {
    return this.prismaService.schoolclass.update(
      {
        where: {id, teachers: {some: {teacherId: userId}}},
        data: {
          isArchived: false
        }
      }
    );
  }
}
