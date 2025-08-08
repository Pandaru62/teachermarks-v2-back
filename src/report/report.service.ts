import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {

    constructor(private readonly prismaService: PrismaService) {}

    async create(body : UpdateReportDto, studentId : number) {
        return this.prismaService.report.create({
            data: {
                description: body.description,
                trimester: body.trimester,
                student: {
                    connect: {
                        id: studentId
                    }
                }
            }
        })
    }

    async update(body : UpdateReportDto, reportId : number) {
        return this.prismaService.report.update({
            data: {
                description: body.description
            },
            where: {
                id: reportId
            }
        })
    }

    async getByStudentId(studentId : number) {
        return this.prismaService.report.findMany({
            where: {
                studentId
            }
        })
    }
    

}
