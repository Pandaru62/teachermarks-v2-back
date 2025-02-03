import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { skill } from '@prisma/client';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  private async validateSkill(id: number): Promise<skill> {
          const data = await this.skillService.getById(id);
          if(!data) throw new BadRequestException(`Skill with ${id} not found`)
          return data;
        }

  @Post()
  async create(@Body() body: CreateSkillDto): Promise<skill> {
    return this.skillService.create(body);
  }

  @Get()
  async findAll(): Promise<skill[]> {
    return this.skillService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<skill> {
    return this.validateSkill(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSkillDto: UpdateSkillDto): Promise<skill> {
    await this.validateSkill(id);
    return this.skillService.update(id, updateSkillDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<skill> {
    await this.validateSkill(id);
    return this.skillService.remove(id);
  }
}
