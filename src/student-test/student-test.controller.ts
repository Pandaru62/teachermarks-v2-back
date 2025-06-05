import { Controller, Get, Post, Body, Param, Delete, Req, ParseIntPipe, Put } from '@nestjs/common';
import { StudentTestService } from './student-test.service';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { IRequestWithUser } from 'src/auth/types';

@Controller('student-test')
export class StudentTestController {
  constructor(
    private readonly studentTestService: StudentTestService,
  ) {}

  @Post('/:studentId/student/:testId/test')
  create(
    @Body() createStudentTestDto: CreateStudentTestDto,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('testId', ParseIntPipe) testId: number
  ) {
    return this.studentTestService.create(createStudentTestDto, studentId, testId);
  }

    @Get('student/:id')
  async findAllByStudentId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser
  ) {
    const studentTests = await this.studentTestService.findAllByStudentId(id, req.user.sub);
    return (studentTests)
  }

  @Get('test/:id')
  async findAllByTestId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser
  ) {
    const studentsTests = await this.studentTestService.findAllByTestId(id, req.user.sub);

    return (studentsTests)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentTestService.findOne(+id);
  }

  @Put('/:studentId/student/:testId/test')
  async createOrUpdate(
    @Body() data: CreateStudentTestDto,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('testId', ParseIntPipe) testId: number,
    @Req() req: IRequestWithUser
  ) {

    // 1. Check if there's already a studentTest with given studentId and testId
    const existingStudentTest = await this.studentTestService.checkIfExists(studentId, testId, req.user.sub)
    // 2. If it exists, update it
    if(existingStudentTest) {
      return this.studentTestService.update(existingStudentTest.id, data)
    }

    // 3. If it does not exist, create it
    if(!existingStudentTest) {
      return this.studentTestService.create(data, studentId, testId);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentTestService.remove(+id);
  }

}