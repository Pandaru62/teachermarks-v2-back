import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, Put } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { skill, UserRoleEnum } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { IRequestWithUser } from 'src/auth/types';

@Roles(UserRoleEnum.TEACHER)
@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  /* CREATE A NEW SKILL */
  @Post()
  async create(
    @Body() body: CreateSkillDto,
    @Req() req: IRequestWithUser
  ): Promise<skill> {
    return this.skillService.create(body, req.user.sub);
  }

  /* GET ALL SKILLS */
  @Get('all')
  async findAll(
  ): Promise<skill[]> {
    return this.skillService.getAll();
  }

  /* GET SKILLS CREATED BY LOGGED USER */
  @Get()
  async findAllByUser(
    @Req() req: IRequestWithUser
  ): Promise<skill[]> {
    return this.skillService.getAllByUser(req.user.sub);
  }

  /* GET SKILL BY ID */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<skill> {
    return this.skillService.getById(id);
  }

  /* UPDATE SKILL FROM ID */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSkillDto,
    @Req() req: IRequestWithUser
  ): Promise<skill> {
    return this.skillService.update(id, body, req.user.sub);
  }

  /* DELETE A SKILL */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: IRequestWithUser
  ): Promise<skill> {
    return this.skillService.remove(id, req.user.sub);
  }
}
