import { Injectable } from '@nestjs/common';
import { student } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateManyStudentsDto, CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {

    constructor(private readonly prismaService: PrismaService) {}

    async getAll(userId: number): Promise<student[]> {
        return this.prismaService.student.findMany({
            where: {
                schoolClasses: {
                    some: {
                        schoolClass: {
                            teachers: {
                                some: {
                                    userId
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    async getStudentsByClass(schoolClassId: number): Promise<student[]> {
        return this.prismaService.student.findMany({
            where: {
                schoolClasses: {
                    some: {
                        schoolClassId
                    }
                }
            }
        })
    }

    async getById(id: number): Promise<student> {
        return this.prismaService.student.findUnique({
        where: {id}
        })
    }

    async create(data: CreateStudentDto): Promise<student> {
        const newStudent = await this.prismaService.student.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
            },
        });
    
        // Add the student to the schoolClasses
        await Promise.all(
            data.schoolClassId.map(async (nb) => {
                await this.prismaService.studentHasSchoolClass.create({
                    data: {
                        schoolClassId: nb,
                        studentId: newStudent.id,
                    },
                });
            })
        );
    
        return newStudent;
    }
    

    async createMany(data: CreateManyStudentsDto[]): Promise<student[]> {
        if (data.length === 0) return [];
    
        const schoolClassId: number = data[0].schoolClassId;
    
        // Create students one by one and return their data
        const newStudents = await Promise.all(
            data.map(async (student) => {
                return this.prismaService.student.create({
                    data: {
                        firstName: student.firstName,
                        lastName: student.lastName
                    }
                });
            })
        );
    
        // Link each student to the school class
        await Promise.all(
            newStudents.map(student =>
                this.prismaService.studentHasSchoolClass.create({
                    data: {
                        schoolClassId,
                        studentId: student.id
                    }
                })
            )
        );
    
        return newStudents;
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
