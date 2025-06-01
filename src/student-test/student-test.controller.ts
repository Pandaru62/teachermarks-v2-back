import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseIntPipe } from '@nestjs/common';
import { StudentTestService } from './student-test.service';
import { CreateStudentTestDto } from './dto/create-student-test.dto';
import { UpdateStudentTestDto } from './dto/update-student-test.dto';
import { IRequestWithUser } from 'src/auth/types';

@Controller('student-test')
export class StudentTestController {
  constructor(
    private readonly studentTestService: StudentTestService,
  ) {}

  @Post()
  create(@Body() createStudentTestDto: CreateStudentTestDto) {
    return this.studentTestService.create(createStudentTestDto);
  }

  @Get('test/:id')
  async findAllByTestId(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser
  ) {
    // !!! Check rights
    const studentsTests = await this.studentTestService.findAllByTestId(id);

    return (studentsTests)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentTestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentTestDto: UpdateStudentTestDto) {
    return this.studentTestService.update(+id, updateStudentTestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentTestService.remove(+id);
  }
}
