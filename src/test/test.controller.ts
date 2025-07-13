import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  Put,
  Req,
} from '@nestjs/common';
import { test } from '@prisma/client';
import { TestService, TestWithClassAndSkills } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { IRequestWithUser } from 'src/auth/types';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  private async validatetest(id: number): Promise<TestWithClassAndSkills> {
    const data = await this.testService.getById(id);
    if (!data) throw new BadRequestException(`Test with ${id} not found`);
    return data;
  }

  @Post()
  async create(@Body() body: CreateTestDto): Promise<test> {
    // check userId and classId ??
    return this.testService.create(body);
  }

  @Get()
  async findAll(@Req() req: IRequestWithUser): Promise<test[]> {
    return this.testService.getAll(req.user.sub);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TestWithClassAndSkills> {
    return this.validatetest(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTestDto,
  ): Promise<TestWithClassAndSkills> {
    await this.validatetest(id);
    return this.testService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<test> {
    await this.validatetest(id);
    return this.testService.remove(id);
  }
}
