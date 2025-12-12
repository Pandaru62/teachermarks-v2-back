import { Injectable } from '@nestjs/common';
import { student, TrimesterEnum } from 'prisma/generated/browser';
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
            },
            orderBy: {
                lastName: 'asc'
            }
        })
    }

    async getStudentsByClass(schoolClassId: number): Promise<any> {
        return this.prismaService.student.findMany({
            where: {
                schoolClasses: {
                    some: {
                        schoolClassId
                    }
                }
            },
            select: {
                firstName: true,
                id: true,
                lastName: true,
                schoolClasses: {
                    select: {
                        schoolClass: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                lastName: 'asc'
            }
        })
    }

    async getById(id: number): Promise<{id: number, firstName: string, lastName: string, classes: {name: string, id: number}[]}> {
    const studentWithClass = await this.prismaService.student.findUnique({
        where: { id },
        include: {
        schoolClasses: {
            select: {
            schoolClass: {
                select: {
                name: true,
                id: true
                }
            }
            }
        }
        }
    });

    if (!studentWithClass) {
        throw new Error(`Student with id ${id} not found`);
    }

    return {
        id: studentWithClass.id,
        firstName: studentWithClass.firstName,
        lastName: studentWithClass.lastName,
        classes: studentWithClass.schoolClasses.map(entry => ({
        name: entry.schoolClass.name,
        id: entry.schoolClass.id
        }))
    };
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

        // Create their reports for each trimester
        const trimesters = [TrimesterEnum.TR1, TrimesterEnum.TR2, TrimesterEnum.TR3];

        await Promise.all(
            newStudents.flatMap(student =>
                trimesters.map(trimester =>
                this.prismaService.report.create({
                    data: {
                    description: "",
                    trimester,
                    studentId: student.id,
                    },
                })
                )
            )
        );
    
        return newStudents;
    }
    

    async update(id: number, data: UpdateStudentDto): Promise<{id: number, firstName: string, lastName: string, classes: {name: string, id: number}[]}> {
        const updatedStudent = await this.prismaService.student.update({
            where: {id},
            data
        })

        if(updatedStudent) {
            return this.getById(id);
        }

    }

    async remove(id: number): Promise<student> {
            return this.prismaService.student.delete({
            where: {id}
            })
        }
  
}
