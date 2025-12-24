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

import { IRequestWithUser } from 'src/auth/types';
import { testTagOutput, TestTagService } from './testtag.service';
import { CreateTestTagDto } from './dto/create-testtag-dto';
import { UpdateTestTagDto } from './dto/update-testtag-dto';

@Controller('testtags')
export class TestTagController {
  constructor(private readonly testTagService: TestTagService) {}

  @Post()
  async create(@Body() body: CreateTestTagDto, @Req() req: IRequestWithUser): Promise<testTagOutput> {
    return this.testTagService.create(body, req.user.sub);
  }

  @Get()
  async findAll(@Req() req: IRequestWithUser): Promise<testTagOutput[]> {
    return this.testTagService.getAll(req.user.sub);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<testTagOutput> {
    return this.testTagService.getById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTestTagDto,
  ): Promise<testTagOutput> {
    return this.testTagService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<testTagOutput> {
    return this.testTagService.remove(id);
  }
}
