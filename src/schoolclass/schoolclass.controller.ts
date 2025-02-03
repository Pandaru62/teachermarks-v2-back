import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { SchoolclassService } from './schoolclass.service';
import { CreateSchoolclassDto } from './dto/create-schoolclass.dto';
import { UpdateSchoolclassDto } from './dto/update-schoolclass.dto';
import { schoolclass } from '@prisma/client';

@Controller('classes')
export class SchoolclassController {
  constructor(private readonly schoolclassService: SchoolclassService) {}

  private async validateClass(id: number): Promise<schoolclass> {
    const data = await this.schoolclassService.findOne(id);
    if(!data) throw new BadRequestException(`Class with ${id} not found`)
    return data;
  }

  @Post()
  async create(@Body() createSchoolclassDto: CreateSchoolclassDto) {
    return this.schoolclassService.create(createSchoolclassDto);
  }

  @Get()
  async findAll(): Promise<schoolclass[]> {
    return this.schoolclassService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<schoolclass> {
    return this.validateClass(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSchoolclassDto: UpdateSchoolclassDto) {
    await this.validateClass(id);
    return this.schoolclassService.update(id, updateSchoolclassDto);
  }

  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    await this.validateClass(id);
    return this.schoolclassService.remove(id);
  }

}
