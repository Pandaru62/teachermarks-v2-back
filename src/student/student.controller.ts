import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put, Req } from '@nestjs/common';
import { student } from '@prisma/client';
import { StudentService } from './student.service';
import { CreateManyStudentsDto, CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { IRequestWithUser } from 'src/auth/types';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() body: CreateStudentDto): Promise<student> {
    return this.studentService.create(body);
  }

  @Post()
  async createMany(@Body() body: CreateManyStudentsDto[]): Promise<student[]> {
    return this.studentService.createMany(body);
  }

  @Get()
  async findAll(
    @Req() req: IRequestWithUser
  ): Promise<student[]> {
    return this.studentService.getAll(req.user.sub);
  }

  @Get(':classId/class')
  async findAllByClass(
    @Param('classId', ParseIntPipe) classId: number
  ): Promise<student[]> {
    return this.studentService.getStudentsByClass(classId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) : Promise<student> {
    return this.studentService.getById(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStudentDto): Promise<student> {
    return this.studentService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<student> {
    return this.studentService.remove(id);
  }
}
