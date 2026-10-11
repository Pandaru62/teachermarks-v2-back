import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  Req,
} from '@nestjs/common';
import { student } from 'prisma/generated/browser';
import { StudentService } from './student.service';
import { CreateStudentsDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { IRequestWithUser } from 'src/auth/types';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async createMany(
    @Body() body: CreateStudentsDto,
    @Req() req: IRequestWithUser,
  ): Promise<student[]> {
    return this.studentService.createMany(body.students, req.user.sub);
  }

  @Get()
  async findAll(@Req() req: IRequestWithUser): Promise<student[]> {
    return this.studentService.getAll(req.user.sub);
  }

  @Get(':classId/class')
  async findAllByClass(
    @Param('classId', ParseIntPipe) classId: number,
    @Req() req: IRequestWithUser,
  ): Promise<student[]> {
    return this.studentService.getStudentsByClass(classId, req.user.sub);
  }

  // TYPE
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
  ) {
    return this.studentService.getById(id, req.user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStudentDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.studentService.update(id, body, req.user.sub);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser,
  ): Promise<student> {
    return this.studentService.remove(id, req.user.sub);
  }
}
