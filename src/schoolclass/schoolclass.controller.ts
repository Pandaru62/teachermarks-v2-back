import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { SchoolclassService } from './schoolclass.service';
import { CreateSchoolclassDto } from './dto/create-schoolclass.dto';
import { UpdateSchoolclassDto } from './dto/update-schoolclass.dto';
import { schoolclass, UserRoleEnum } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { IRequestWithUser } from 'src/auth/types';

@Roles(UserRoleEnum.TEACHER)
@Controller('classes')
export class SchoolclassController {
  constructor(private readonly schoolclassService: SchoolclassService) {}

  /* CREATE A NEW CLASS */
  @Post()
  async create(
    @Body() createSchoolclassDto: CreateSchoolclassDto,
    @Req() req : IRequestWithUser
  ) {
    return this.schoolclassService.create(createSchoolclassDto, req.user.sub);
  }

  /* FIND ALL ASSIGNED CLASSES BY TEACHER ID */
  @Get()
  async findAll(
    @Req() req : IRequestWithUser
  ): Promise<schoolclass[]> {    
    return this.schoolclassService.findAll(req.user.sub);
  }

  /* FIND ONE CLASS BY THEIR ID */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req : IRequestWithUser
  ): Promise<schoolclass> {
    return this.schoolclassService.findOne(id, req.user.sub);
  }

  /* UPDATE A CLASS BY THEIR ID */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolclassDto: UpdateSchoolclassDto,
    @Req() req : IRequestWithUser
  ): Promise<schoolclass> {
    return this.schoolclassService.update(id, updateSchoolclassDto, req.user.sub);
  }

  /* DELETE A CLASS BY THEIR ID */
  @Delete(':id')
  async remove(
    @Param('id',ParseIntPipe) id: number,
    @Req() req : IRequestWithUser
  ): Promise<schoolclass> {
    return this.schoolclassService.remove(id, req.user.sub);
  }

}
