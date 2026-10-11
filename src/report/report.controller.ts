import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
} from '@nestjs/common';
import { report } from 'prisma/generated/browser';
import { ReportService } from './report.service';
import { UpdateReportDto } from './dto/update-report.dto';
import { IRequestWithUser } from 'src/auth/types';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReportDto,
    @Req() req: IRequestWithUser,
  ): Promise<report> {
    return this.reportService.update(body, id, req.user.sub);
  }

  @Get(':studentId')
  async findAllByClass(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: IRequestWithUser,
  ): Promise<report[]> {
    return this.reportService.getByStudentId(studentId, req.user.sub);
  }
}
