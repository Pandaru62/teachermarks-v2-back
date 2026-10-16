import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  Put,
  Res,
} from '@nestjs/common';
import { StudentTestService } from './student-test.service';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { IRequestWithUser } from 'src/auth/types';
import { BatchUpdateStudentTestDto } from './dto/batch-update-student-test.dto';
import { Response } from 'express';

@Controller('student-test')
export class StudentTestController {
  constructor(private readonly studentTestService: StudentTestService) {}

  @Post('/:studentId/student/:testId/test')
  create(
    @Body() createStudentTestDto: CreateStudentTestDto,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('testId', ParseIntPipe) testId: number,
  ) {
    return this.studentTestService.create(
      createStudentTestDto,
      studentId,
      testId,
    );
  }

  @Get('student/:id')
  async findAllByStudentId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
  ) {
    const studentTests = await this.studentTestService.findAllByStudentId(
      id,
      req.user.sub,
    );
    return studentTests;
  }

  @Get('csv/test/:id/export')
  async exportByTestId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ) {
    const studentsTests = await this.studentTestService.findAllByTestId(
      id,
      req.user.sub,
    );

    const csv = this.studentTestService.generateCsv(studentsTests);

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="evaluation-${id}.csv"`,
    });

    return res.send('\uFEFF' + csv);
  }

  @Get('pdf/test/:id/export')
  async exportPdfByTestId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ) {
    const studentsTests = await this.studentTestService.findAllByTestId(
      id,
      req.user.sub,
    );
    const pdf = await this.studentTestService.generatePdf(studentsTests);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="evaluation-${id}.pdf"`,
    });

    return res.send(pdf);
  }

  @Get('grid-pdf/test/:id/export')
  async exportGridPdfByTestId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
    @Res() res: Response,
  ) {
    const studentsTests = await this.studentTestService.findAllByTestId(
      id,
      req.user.sub,
    );
    const pdf = await this.studentTestService.generateGridPdf(studentsTests);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="evaluation-${id}.pdf"`,
    });

    return res.send(pdf);
  }

  @Get('test/:id')
  async findAllByTestId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
  ) {
    const studentsTests = await this.studentTestService.findAllByTestId(
      id,
      req.user.sub,
    );

    return studentsTests;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentTestService.findOne(+id);
  }

  @Put('/:testId/batch')
  async batchUpdate(
    @Body() payload: BatchUpdateStudentTestDto,
    @Param('testId', ParseIntPipe) testId: number,
    @Req() req: IRequestWithUser,
  ) {
    return this.studentTestService.batchUpsert(testId, req.user.sub, payload);
  }

  @Put('/:studentId/student/:testId/test')
  async createOrUpdate(
    @Body() data: CreateStudentTestDto,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('testId', ParseIntPipe) testId: number,
    @Req() req: IRequestWithUser,
  ) {
    // 1. Check if there's already a studentTest with given studentId and testId
    const existingStudentTest = await this.studentTestService.checkIfExists(
      studentId,
      testId,
      req.user.sub,
    );
    // 2. If it exists, update it
    if (existingStudentTest) {
      return this.studentTestService.update(existingStudentTest.id, data);
    }

    // 3. If it does not exist, create it
    if (!existingStudentTest) {
      return this.studentTestService.create(data, studentId, testId);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentTestService.remove(+id);
  }
}
