import { Body, Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { report } from '@prisma/client';
import { ReportService } from './report.service';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportController {
    
    constructor(private readonly reportService: ReportService) {}
    
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateReportDto
    ): Promise<report> {
        return this.reportService.update(body, id);
      }

    @Get(':studentId')
      async findAllByClass(
        @Param('studentId', ParseIntPipe) studentId: number
      ): Promise<report[]> {
        return this.reportService.getByStudentId(studentId);
      }

}
