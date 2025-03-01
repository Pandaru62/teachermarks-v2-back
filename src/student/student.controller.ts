import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, BadRequestException, Put } from '@nestjs/common';
import { student } from '@prisma/client';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  private async validateStudent(id: number): Promise<student> {
    const data = await this.studentService.getById(id);
    if(!data) throw new BadRequestException(`Student with ${id} not found`);
    return data;
  }

  @Post()
  async create(@Body() body: CreateStudentDto): Promise<student> {
    return this.studentService.create(body);
  }

  @Get()
  async findAll(): Promise<student[]> {
    return this.studentService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) : Promise<student> {
    return this.validateStudent(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStudentDto): Promise<student> {
    await this.validateStudent(id);
    return this.studentService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<student> {
    await this.validateStudent(id);
    return this.studentService.remove(id);
  }
}
